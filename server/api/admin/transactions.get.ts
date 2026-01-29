// server/api/admin/transactions.get.ts - NEW FILE
import { TransactionLog, User } from '~/server/database/models'
import { Op } from 'sequelize'

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
    const userId = query.userId ? parseInt(query.userId as string) : null
    const limit = query.limit ? parseInt(query.limit as string) : 50
    const offset = query.offset ? parseInt(query.offset as string) : 0
    
    // Build where clause
    const whereClause: any = {}
    
    // Filter by user if specified
    if (userId) {
      whereClause.userId = userId
    }
    
    // Add other filters
    if (query.type) {
      whereClause.type = query.type
    }
    
    if (query.status) {
      whereClause.status = query.status
    }
    
    if (query.startDate) {
      const startDate = new Date(query.startDate as string)
      whereClause.createdAt = {
        [Op.gte]: startDate
      }
    }
    
    if (query.endDate) {
      const endDate = new Date(query.endDate as string)
      endDate.setHours(23, 59, 59, 999)
      
      if (whereClause.createdAt) {
        whereClause.createdAt[Op.lte] = endDate
      } else {
        whereClause.createdAt = {
          [Op.lte]: endDate
        }
      }
    }
    
    // Fetch transactions with user and admin associations
    const { rows: transactions, count: total } = await TransactionLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'email']
        }
      ]
    })
    
    // Format transactions
    const formattedTransactions = transactions.map(transaction => {
      const data = transaction.get({ plain: true })
      
      return {
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount) || 0,
        previousBalance: parseFloat(data.previousBalance) || 0,
        newBalance: parseFloat(data.newBalance) || 0,
        description: data.description || '',
        referenceId: data.referenceId || '',
        metadata: data.metadata || {},
        status: data.status || 'completed',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        userId: data.userId,
        adminId: data.adminId,
        user: data.user,
        admin: data.admin
      }
    })
    
    // Calculate summary
    const summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalRefunds: 0,
      totalPayments: 0,
      totalListingFees: 0,
      totalFeatureFees: 0,
      totalBidPayments: 0,
      transactionCount: formattedTransactions.length,
      netChange: 0
    }
    
    formattedTransactions.forEach(transaction => {
      const amount = transaction.amount
      
      if (amount > 0) {
        if (transaction.type === 'deposit') {
          summary.totalDeposits += amount
        } else if (transaction.type === 'refund') {
          summary.totalRefunds += amount
        }
        summary.netChange += amount
      } else if (amount < 0) {
        if (transaction.type === 'withdrawal' || transaction.type === 'payment') {
          summary.totalPayments += Math.abs(amount)
        }
        summary.netChange += amount
      }
    })
    
    return {
      success: true,
      transactions: formattedTransactions,
      summary,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
    
  } catch (error: any) {
    console.error('Admin transactions API error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to load transactions'
    })
  }
})