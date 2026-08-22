// server/api/user/add-funds.post.ts
//
// SECURITY: this endpoint used to let ANY signed-in user credit their own
// wallet with up to 10'000 CHF per call — free listing fees and free bidding
// power for anyone who found the URL. There is no payment provider wired up
// yet, so the only legitimate caller is an administrator topping up an account
// by hand, which is exactly what /api/admin/users/[id]/funds already does.
import { requireAdmin } from '~/server/utils/auth'
import { WalletService } from '~/server/services/walletService'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const { amount, userId } = await readBody(event)
  const amountNum = Number(amount)
  const targetId = Number(userId)

  if (!targetId || Number.isNaN(targetId)) {
    throw createError({ statusCode: 400, statusMessage: 'userId is required' })
  }
  if (Number.isNaN(amountNum) || amountNum <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
  }
  if (amountNum > 10000) {
    throw createError({ statusCode: 400, statusMessage: 'Maximum single deposit is 10,000 CHF' })
  }

  try {
    const result = await WalletService.addFunds(targetId, amountNum, 'Admin deposit', admin.id)
    return {
      success: true,
      newBalance: result.newBalance,
      previousBalance: result.previousBalance,
      amountAdded: amountNum,
    }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message || 'Failed to add funds' })
  }
})
