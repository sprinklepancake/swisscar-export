// server/api/user/add-funds.post.ts - REPLACE ENTIRE FILE
import { WalletService } from '~/server/services/walletService'

export default defineEventHandler(async (event) => {
  try {
    const { amount } = await readBody(event)
    const amountNum = Number(amount)
    
    if (isNaN(amountNum) || amountNum <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
    }
    if (amountNum > 10000) {
      throw createError({ statusCode: 400, statusMessage: 'Maximum single deposit is 10,000 CHF' })
    }
    
    const user = event.context.user || event.context.auth
    if (!user || !user.id) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    
    console.log('Add funds - User ID:', user.id, 'Amount:', amountNum)
    const result = await WalletService.addFunds(user.id, amountNum, 'Manual deposit')
    
    return { success: true, newBalance: result.newBalance, previousBalance: result.previousBalance, amountAdded: amountNum }
  } catch (error: any) {
    console.error('Add funds error:', error)
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message || 'Failed to add funds' })
  }
})