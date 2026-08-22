// server/api/admin/users/[id]/funds.post.ts
//
// This used to SET an absolute balance taken from the browser: the admin page
// computed `currentBalance + amount` client-side and posted the result. Any
// listing fee, bid or refund that happened between the page loading and the
// admin pressing save was silently erased.
//
// It now accepts a DELTA and computes the new balance server-side, atomically.
// The absolute form is still honoured (`{ amount, absolute: true }`) so an
// older cached admin page keeps working, but even then the movement is derived
// from the balance read inside this request, not from the browser's copy.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'
import { adjustFunds } from '~/server/utils/wallet'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const userId = parseInt(String(getRouterParam(event, 'id')), 10)
  if (!userId || Number.isNaN(userId)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid user ID is required' })
  }

  const body = (await readBody(event)) || {}
  const { amount, delta, absolute, reason } = body

  const supabase = getSupabaseAdmin()
  const { data: target } = await supabase.from('users').select('id, name, funds').eq('id', userId).single()
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const currentBalance = parseFloat(String(target.funds ?? 0)) || 0

  let movement: number
  if (delta !== undefined) {
    movement = parseFloat(String(delta))
  } else if (absolute) {
    const target_ = parseFloat(String(amount))
    if (Number.isNaN(target_)) throw createError({ statusCode: 400, statusMessage: 'A valid amount is required' })
    movement = target_ - currentBalance
  } else {
    movement = parseFloat(String(amount))
  }

  if (Number.isNaN(movement)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid amount is required' })
  }
  if (movement === 0) {
    return { success: true, message: 'No change', newBalance: currentBalance }
  }
  if (Math.abs(movement) > 100000) {
    throw createError({ statusCode: 400, statusMessage: 'That adjustment is too large. Maximum 100,000 CHF per operation.' })
  }

  const { previousBalance, newBalance } = await adjustFunds(
    userId,
    movement,
    {
      type: movement >= 0 ? 'deposit' : 'withdrawal',
      adminId: admin.id,
      description: reason
        ? `Admin ${admin.name}: ${reason}`
        : `Admin ${admin.name} adjusted funds`,
    },
    // An administrator is allowed to take a balance below zero deliberately
    // (for example to reverse a mistaken credit that has already been spent).
    true,
  )

  return {
    success: true,
    message: 'Funds updated successfully',
    newBalance,
    transaction: {
      type: movement >= 0 ? 'deposit' : 'withdrawal',
      amount: movement,
      previousBalance,
      newBalance,
    },
  }
})
