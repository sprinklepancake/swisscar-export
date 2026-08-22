// server/utils/wallet.ts
//
// One place for every wallet movement, so the ledger and the balance can never
// disagree again.
//
// Before this, each endpoint did its own read-modify-write of an ABSOLUTE
// balance (read funds → add/subtract in JS → write the result back) and then
// wrote a transaction_logs row by hand, sometimes forgetting previous_balance.
// Two overlapping movements silently erased one another.
//
// adjustFunds() prefers the atomic `adjust_user_funds` Postgres function added
// in migration 0002. If that migration has not been run yet it falls back to
// the old behaviour, so nothing breaks — but the race is only really gone once
// the migration is applied.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export interface LedgerEntry {
  type: string
  description: string
  referenceId?: string | number | null
  carId?: number | null
  adminId?: number | null
  status?: string
}

export interface FundsResult {
  previousBalance: number
  newBalance: number
}

const num = (v: any) => {
  const n = parseFloat(String(v ?? 0))
  return Number.isFinite(n) ? n : 0
}

export class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient funds') {
    super(message)
    this.name = 'InsufficientFundsError'
  }
}

/**
 * Move money and write the matching ledger row.
 *
 * @param delta positive to credit, negative to debit.
 * @param allowNegative only ever true for an administrator forcing a balance.
 */
export async function adjustFunds(
  userId: number,
  delta: number,
  entry: LedgerEntry,
  allowNegative = false,
): Promise<FundsResult> {
  const supabase = getSupabaseAdmin()

  let previousBalance: number
  let newBalance: number

  const { data: rpcData, error: rpcError } = await supabase.rpc('adjust_user_funds', {
    p_user_id: userId,
    p_delta: delta,
    p_allow_negative: allowNegative,
  })

  if (!rpcError && rpcData) {
    const row: any = Array.isArray(rpcData) ? rpcData[0] : rpcData
    previousBalance = num(row?.previous_balance)
    newBalance = num(row?.new_balance)
  } else {
    // The function raises 'insufficient funds' as a check_violation; that is a
    // real answer, not a missing-function fallback.
    if (rpcError && /insufficient funds/i.test(rpcError.message || '')) {
      throw new InsufficientFundsError()
    }
    if (rpcError && /not found/i.test(rpcError.message || '')) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // ── Fallback for databases where migration 0002 has not been run ────────
    const { data: user } = await supabase.from('users').select('funds').eq('id', userId).single()
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    previousBalance = num(user.funds)
    newBalance = previousBalance + delta
    if (newBalance < 0 && !allowNegative) throw new InsufficientFundsError()

    const { error: updateError } = await supabase.from('users').update({ funds: newBalance }).eq('id', userId)
    if (updateError) throw createError({ statusCode: 500, statusMessage: 'Could not update the wallet balance' })
  }

  // The ledger row is written with the real before/after values — several call
  // sites used to omit previous_balance, which then defaulted to 0 and made the
  // transaction history nonsense.
  const row: Record<string, any> = {
    user_id: userId,
    type: entry.type,
    amount: delta,
    previous_balance: previousBalance,
    new_balance: newBalance,
    description: entry.description,
    status: entry.status || 'completed',
  }
  if (entry.referenceId !== undefined && entry.referenceId !== null) row.reference_id = String(entry.referenceId)
  if (entry.carId) row.car_id = entry.carId
  if (entry.adminId) row.admin_id = entry.adminId

  const { error: logError } = await supabase.from('transaction_logs').insert(row)
  if (logError) {
    // Never leave money moved with nothing recorded — put it back.
    console.error('[wallet] ledger insert failed, reverting balance:', logError.message)
    try {
      const { error: revertError } = await supabase.rpc('adjust_user_funds', {
        p_user_id: userId, p_delta: -delta, p_allow_negative: true,
      })
      if (revertError) {
        await supabase.from('users').update({ funds: previousBalance }).eq('id', userId)
      }
    } catch {
      await supabase.from('users').update({ funds: previousBalance }).eq('id', userId).then(() => {}, () => {})
    }
    throw createError({ statusCode: 500, statusMessage: 'Could not record the transaction. Nothing was charged.' })
  }

  return { previousBalance, newBalance }
}

/**
 * Return every deposit still held against a car and retire those bids.
 *
 * Used when a listing is deleted, or when an auction is settled, so a bidder's
 * money can never vanish with the listing. The bids are claimed FIRST (the
 * UPDATE … RETURNING only yields rows this call actually changed), so two
 * concurrent callers cannot both refund the same deposit.
 */
export async function releaseHeldBids(
  carId: number,
  opts: { exceptBidId?: number; reason: string; newStatus?: string } = { reason: 'Auction closed' },
): Promise<number> {
  const supabase = getSupabaseAdmin()

  let claim = supabase
    .from('bids')
    .update({ status: opts.newStatus || 'refunded' })
    .eq('car_id', carId)
    .eq('status', 'pending')

  if (opts.exceptBidId) claim = claim.neq('id', opts.exceptBidId)

  const { data: released, error } = await claim.select('id, user_id, amount')
  if (error) {
    console.error('[wallet] could not claim bids for refund:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Could not release the held bids' })
  }

  let count = 0
  for (const bid of released || []) {
    const amount = num(bid.amount)
    if (!bid.user_id || amount <= 0) continue
    try {
      await adjustFunds(bid.user_id, amount, {
        type: 'refund',
        description: opts.reason,
        referenceId: bid.id,
        carId,
      })
      count++
    } catch (err: any) {
      console.error('[wallet] refund failed for bid', bid.id, err?.message || err)
    }
  }
  return count
}
