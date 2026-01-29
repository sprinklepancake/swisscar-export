// server/api/user/transactions.get.ts - FIXED VERSION
import { TransactionLog, User } from '~/server/database/models'
import { Op } from 'sequelize'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Transactions API Debug Start ===')
    
    // Get user from token
    const accessToken = getCookie(event, 'access_token')
    console.log('Transactions API - Access token:', accessToken ? 'Present' : 'Missing')
    
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Please login to view transactions'
      })
    }
    
    const config = useRuntimeConfig()
    const decoded = jwt.verify(accessToken, config.jwtAccessSecret) as any
    const userId = decoded.userId || decoded.id
    
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication token'
      })
    }
    
    console.log('Transactions API - User ID:', userId)
    
    // Get query parameters
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit as string) : 50
    const offset = query.offset ? parseInt(query.offset as string) : 0
    
    // Build where clause
    const whereClause: any = {
      userId
    }
    
    // Add filters if provided
    if (query.type) {
      whereClause.type = query.type
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
    
    console.log('Transactions API - Where clause:', whereClause)
    
    // FIXED: Remove the problematic include and fetch admin separately
    const { rows: transactions, count: total } = await TransactionLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      raw: false
    })
    
    console.log('Transactions API - Found transactions:', transactions.length)
    
    // Get admin details for transactions that have adminId
    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const data = transaction.get({ plain: true })
        
        // Handle Decimal values
        const amount = parseFloat(data.amount) || 0
        const previousBalance = parseFloat(data.previousBalance) || 0
        const newBalance = parseFloat(data.newBalance) || 0
        
        // Get admin details if adminId exists
        let admin = null
        if (data.adminId) {
          const adminUser = await User.findByPk(data.adminId, {
            attributes: ['id', 'name', 'email']
          })
          if (adminUser) {
            admin = {
              id: adminUser.id,
              name: adminUser.name,
              email: adminUser.email
            }
          }
        }
        
        return {
          id: data.id,
          type: data.type,
          amount,
          previousBalance,
          newBalance,
          description: data.description || '',
          referenceId: data.referenceId || '',
          metadata: data.metadata || {},
          status: data.status || 'completed',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userId: data.userId,
          adminId: data.adminId,
          admin: admin // Add admin details
        }
      })
    )
    
    // Calculate summary
    let summary = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPayments: 0,
      totalRefunds: 0,
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
    
    console.log('=== Transactions API Debug End - Success ===')
    
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
    console.error('Transactions API error:', error)
    console.error('Error stack:', error.stack)
    
    if (error.statusCode === 401) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load transaction history'
    })
  }
})