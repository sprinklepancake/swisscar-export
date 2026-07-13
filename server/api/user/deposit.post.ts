// server/api/user/deposit.post.ts
// SECURITY FIX: self-service deposits are DISABLED until a real payment
// provider (Stripe / Datatrans / TWINT) is integrated. Previously any logged-in
// user could credit their own wallet with no payment, making all fees free.
// Until then, only admins can add funds (via the admin panel).
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Block everyone except admins. Remove this guard only once a real payment
  // gateway verifies the money actually arrived before crediting funds.
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Online deposits are not available yet. Please contact support to add funds.',
    })
  }

  const { amount, paymentMethod, reference, targetUserId } = await readBody(event)
  const depositAmount = parseFloat(amount)

  if (isNaN(depositAmount) || depositAmount <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
  if (depositAmount > 10000) throw createError({ statusCode: 400, statusMessage: 'Maximum single deposit is 10,000 CHF' })

  const creditUserId = targetUserId || user.id

  try {
    const supabase = getSupabaseAdmin()
    const { data: profile } = await supabase.from('users').select('funds').eq('id', creditUserId).single()
    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    const previousBalance = parseFloat(profile.funds || 0)
    const newBalance = previousBalance + depositAmount

    await supabase.from('users').update({ funds: newBalance }).eq('id', creditUserId)

    const { data: transaction } = await supabase.from('transaction_logs').insert({
      user_id: creditUserId,
      admin_id: user.id,
      type: 'deposit',
      amount: depositAmount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      description: `Admin deposit via ${paymentMethod || 'manual'}${reference ? ` (${reference})` : ''}`,
      reference_id: `DEPOSIT-${Date.now()}-${creditUserId}`,
      metadata: { paymentMethod, reference, by: user.id },
    }).select().single()

    return {
      success: true,
      message: 'Deposit successful',
      transaction: { id: transaction?.id, amount: depositAmount, newBalance },
      user: { id: creditUserId, newBalance },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to process deposit' })
  }
})