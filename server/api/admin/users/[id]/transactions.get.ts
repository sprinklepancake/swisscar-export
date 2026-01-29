// server/api/admin/users/[id]/transactions.get.ts
import { TransactionService } from '~/server/services/transactionService'

export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }
    
    const { limit = 50 } = getQuery(event)
    
    const transactions = await TransactionService.getUserTransactions(
      userId,
      parseInt(limit as string)
    )
    
    const summary = await TransactionService.getUserTransactionSummary(userId)
    
    return {
      success: true,
      transactions,
      summary,
      total: transactions.length
    }
  } catch (error) {
    console.error('Error fetching user transactions:', error)
    return {
      success: false,
      error: 'Failed to fetch user transactions'
    }
  }
})