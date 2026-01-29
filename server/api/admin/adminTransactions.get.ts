// server/api/admin/transactions.get.ts
import { TransactionService } from '~/server/services/transactionService'

export default defineEventHandler(async (event) => {
  try {
    // Check admin access
    const user = event.context.user
    if (!user || user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Admin access required'
      })
    }
    
    const query = getQuery(event)
    const filters: any = {}
    
    if (query.userId) {
      filters.userId = parseInt(query.userId as string)
    }
    
    if (query.type) {
      filters.type = query.type as string
    }
    
    if (query.startDate) {
      filters.startDate = new Date(query.startDate as string)
    }
    
    if (query.endDate) {
      filters.endDate = new Date(query.endDate as string)
    }
    
    const transactions = await TransactionService.getAllTransactions(filters)
    
    return {
      success: true,
      transactions,
      total: transactions.length
    }
  } catch (error) {
    console.error('Error fetching admin transactions:', error)
    return {
      success: false,
      error: 'Failed to fetch transactions'
    }
  }
})