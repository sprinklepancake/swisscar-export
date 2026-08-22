// server/api/admin/transactions/[id]/refund.post.ts
//
// This file was completely EMPTY (0 bytes). Nitro still registered the route,
// so the admin panel's "Issue refund" button hit a handler with no default
// export and got a 500 with no explanation.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'
import { adjustFunds } from '~/server/utils/wallet'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const transactionId = getRouterParam(event, 'id')
  if (!transactionId) throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })

  const { reason } = (await readBody(event)) || {}

  const supabase = getSupabaseAdmin()

  const { data: original } = await supabase
    .from('transaction_logs')
    .select('id, user_id, type, amount, description, status, reference_id, car_id')
    .eq('id', transactionId)
    .single()

  if (!original) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  if (original.type === 'refund') throw createError({ statusCode: 400, statusMessage: 'You cannot refund a refund.' })
  if (original.status === 'refunded') throw createError({ statusCode: 400, statusMessage: 'This transaction has already been refunded.' })

  // Only money that left the user's wallet can be given back.
  const originalAmount = parseFloat(String(original.amount)) || 0
  if (originalAmount >= 0) {
    throw createError({ statusCode: 400, statusMessage: 'This transaction did not take money from the user, so there is nothing to refund.' })
  }
  const { data: targetUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', original.user_id)
    .single()

  if (!targetUser) throw createError({ statusCode: 404, statusMessage: 'The user for this transaction no longer exists.' })

  // Claim it atomically: only the caller whose UPDATE actually flipped the row
  // from 'completed' proceeds, so two admins clicking Refund at the same moment
  // cannot both pay out.
  const { data: claimed } = await supabase
    .from('transaction_logs')
    .update({ status: 'refunding' })
    .eq('id', original.id)
    .neq('status', 'refunded')
    .neq('status', 'refunding')
    .select('id')

  if (!claimed || claimed.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'This transaction is already being refunded.' })
  }

  // ── Reverse the underlying commitment, not just the ledger ────────────────
  // A bid_payment is a deposit that is still HELD by a standing bid. Crediting
  // the wallet without retiring that bid means the same money is handed back a
  // second time the moment the bid is outbid — and the bidder stays the highest
  // bidder having paid nothing.
  //
  // The bid is found by car + bidder, NOT by reference_id: the wallet is charged
  // before the bid row exists, so a bid_payment ledger row never carries the bid
  // id. (An earlier version keyed off reference_id and was therefore dead code.)
  let refundAmount = Math.abs(originalAmount)

  if (original.type === 'bid_payment') {
    if (!original.car_id) {
      await supabase.from('transaction_logs').update({ status: original.status || 'completed' }).eq('id', original.id)
      throw createError({
        statusCode: 400,
        statusMessage: 'This bid payment is not linked to a listing, so the bid cannot be reversed safely. Adjust the balance from the Funds tab instead.',
      })
    }

    const { data: retired } = await supabase
      .from('bids')
      .update({ status: 'refunded' })
      .eq('car_id', original.car_id)
      .eq('user_id', original.user_id)
      .eq('status', 'pending')
      .select('id, amount, car_id')

    if (!retired || retired.length === 0) {
      // Nothing is held any more — the bidder was already outbid (and refunded)
      // or the auction has been settled. Paying again would be a double refund.
      await supabase.from('transaction_logs').update({ status: original.status || 'completed' }).eq('id', original.id)
      throw createError({
        statusCode: 400,
        statusMessage: 'This bid is no longer standing — the deposit has already been returned or the auction has been settled. Nothing further is owed.',
      })
    }

    // Return the full deposit that was actually held, not the ledger row's
    // amount. Raising a bid writes two rows (-1000 then -50) against one 1050
    // deposit; refunding either row must give back the whole 1050.
    refundAmount = retired.reduce((sum: number, b: any) => sum + (parseFloat(String(b.amount)) || 0), 0)

    // Hand the auction back to the next live bidder.
    const { data: nextBest } = await supabase
      .from('bids')
      .select('id, user_id, amount')
      .eq('car_id', original.car_id)
      .eq('status', 'pending')
      .order('amount', { ascending: false })
      .limit(1)
      .maybeSingle()

    await supabase.from('cars').update({
      current_bid: nextBest ? nextBest.amount : null,
      highest_bidder_id: nextBest ? nextBest.user_id : null,
    }).eq('id', original.car_id)
  }

  let previousBalance = 0
  let newBalance = 0
  try {
    ;({ previousBalance, newBalance } = await adjustFunds(targetUser.id, refundAmount, {
      type: 'refund',
      adminId: admin.id,
      description: `Refund: ${original.description || 'transaction #' + original.id}${reason ? ` — ${reason}` : ''}`,
      referenceId: original.id,
      carId: original.car_id || null,
    }))
  } catch (err) {
    // Release the claim so the admin can retry.
    await supabase.from('transaction_logs').update({ status: original.status || 'completed' }).eq('id', original.id)
    throw err
  }

  // The claim above already moved this row out of 'completed'; this settles it
  // as 'refunded'. If it fails the money is out but the row still reads
  // 'refunding', so it cannot be paid again — and we say so loudly.
  const { error: markError } = await supabase
    .from('transaction_logs')
    .update({ status: 'refunded' })
    .eq('id', original.id)

  if (markError) {
    console.error('[refund] money was returned but the source transaction could not be marked refunded:', markError.message)
    throw createError({
      statusCode: 500,
      statusMessage: 'The refund was paid out, but it could not be marked as refunded. Do NOT refund this transaction again — check the user\'s balance before doing anything else.',
    })
  }

  return {
    success: true,
    message: `Refunded ${refundAmount.toFixed(2)} CHF`,
    previousBalance,
    newBalance,
  }
})
