// server/api/debug/transactions.get.ts
import { TransactionLog, User } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Get all transactions
    const allTransactions = await TransactionLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    })
    
    // Format for display
    const formatted = allTransactions.map(t => {
      const data = t.get({ plain: true })
      return {
        id: data.id,
        userId: data.userId,
        user: data.user?.name || 'Unknown',
        type: data.type,
        amount: parseFloat(data.amount) || 0,
        description: data.description,
        referenceId: data.referenceId,
        createdAt: data.createdAt,
        adminId: data.adminId
      }
    })
    
    return {
      success: true,
      total: formatted.length,
      transactions: formatted
    }
    
  } catch (error: any) {
    console.error('Debug transaction error:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})