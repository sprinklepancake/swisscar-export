// server/services/transactionService.ts
import { TransactionLog } from '~/server/database/models/TransactionLog'
import { getUserById } from '~/server/database/repositories/userRepository'

export class TransactionService {
  /**
   * Log a transaction for a user
   */
  static async logTransaction({
    userId,
    type,
    amount,
    description,
    referenceId,
    metadata = {},
    adminId,
    status = 'completed'
  }: {
    userId: number
    type: 'deposit' | 'withdrawal' | 'refund' | 'payment' | 'feature_payment' | 'permanent_feature_payment' | 'free_feature' | 'listing_fee' | 'auction_fee' | 'bid_payment' | 'admin_adjustment'
    amount: number
    description: string
    referenceId?: string
    metadata?: any
    adminId?: number
    status?: 'pending' | 'completed' | 'failed' | 'refunded'
  }) {
    try {
      // Get current user balance
      const user = await getUserById(userId)
      if (!user) {
        throw new Error(`User ${userId} not found`)
      }

      const currentBalance = parseFloat((user as any).funds) || 0
      let newBalance = currentBalance

      // Calculate new balance based on transaction type
      // Positive amounts: deposit, refund
      // Negative amounts: withdrawal, payment, fees
      if (amount > 0) {
        newBalance = currentBalance + amount
      } else {
        newBalance = currentBalance + amount // amount is negative for withdrawals
        if (newBalance < 0) {
          throw new Error(`Insufficient funds. Current: ${currentBalance}, Required: ${Math.abs(amount)}`)
        }
      }

      // Create transaction log
      const transaction = await TransactionLog.create({
        userId,
        type,
        amount,
        previousBalance: currentBalance,
        newBalance,
        description,
        referenceId: referenceId || `TX-${Date.now()}-${userId}`,
        metadata,
        status,
        adminId
      })

      console.log(`📝 Transaction logged: ${type} ${amount} CHF for user ${userId}`, {
        referenceId,
        previousBalance: currentBalance,
        newBalance,
        transactionId: transaction.id
      })
      
      return {
        transaction,
        previousBalance: currentBalance,
        newBalance
      }
    } catch (error) {
      console.error('Failed to log transaction:', error)
      throw error
    }
  }

  /**
   * Get user transaction history
   */
  static async getUserTransactions(userId: number, limit = 50, filters: {
    type?: string
    startDate?: Date
    endDate?: Date
    status?: string
  } = {}) {
    try {
      const where: any = { userId }
      
      if (filters.type) {
        where.type = filters.type
      }
      
      if (filters.status) {
        where.status = filters.status
      }
      
      if (filters.startDate || filters.endDate) {
        where.createdAt = {}
        if (filters.startDate) {
          where.createdAt.$gte = filters.startDate
        }
        if (filters.endDate) {
          where.createdAt.$lte = filters.endDate
        }
      }
      
      const transactions = await TransactionLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        include: [
          {
            association: 'Admin',
            attributes: ['id', 'name', 'email']
          }
        ]
      })
      
      return transactions.map(t => ({
        id: t.getDataValue('id'),
        userId: t.getDataValue('userId'),
        type: t.getDataValue('type'),
        amount: parseFloat(t.getDataValue('amount')),
        previousBalance: parseFloat(t.getDataValue('previousBalance')),
        newBalance: parseFloat(t.getDataValue('newBalance')),
        description: t.getDataValue('description'),
        referenceId: t.getDataValue('referenceId'),
        metadata: t.getDataValue('metadata'),
        status: t.getDataValue('status'),
        adminId: t.getDataValue('adminId'),
        admin: t.Admin ? {
          id: t.Admin.getDataValue('id'),
          name: t.Admin.getDataValue('name'),
          email: t.Admin.getDataValue('email')
        } : null,
        createdAt: t.getDataValue('createdAt'),
        updatedAt: t.getDataValue('updatedAt')
      }))
    } catch (error) {
      console.error('Failed to fetch user transactions:', error)
      throw error
    }
  }

  /**
   * Get all transactions (for admin)
   */
  static async getAllTransactions(filters: {
    userId?: number
    type?: string
    startDate?: Date
    endDate?: Date
    status?: string
    limit?: number
  } = {}) {
    try {
      const where: any = {}
      
      if (filters.userId) {
        where.userId = filters.userId
      }
      
      if (filters.type) {
        where.type = filters.type
      }
      
      if (filters.status) {
        where.status = filters.status
      }
      
      if (filters.startDate || filters.endDate) {
        where.createdAt = {}
        if (filters.startDate) {
          where.createdAt.$gte = filters.startDate
        }
        if (filters.endDate) {
          where.createdAt.$lte = filters.endDate
        }
      }
      
      const transactions = await TransactionLog.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100,
        include: [
          {
            association: 'User',
            attributes: ['id', 'name', 'email', 'role']
          },
          {
            association: 'Admin',
            attributes: ['id', 'name', 'email']
          }
        ]
      })
      
      return transactions.map(t => ({
        id: t.getDataValue('id'),
        userId: t.getDataValue('userId'),
        user: t.User ? {
          id: t.User.getDataValue('id'),
          name: t.User.getDataValue('name'),
          email: t.User.getDataValue('email'),
          role: t.User.getDataValue('role')
        } : null,
        type: t.getDataValue('type'),
        amount: parseFloat(t.getDataValue('amount')),
        previousBalance: parseFloat(t.getDataValue('previousBalance')),
        newBalance: parseFloat(t.getDataValue('newBalance')),
        description: t.getDataValue('description'),
        referenceId: t.getDataValue('referenceId'),
        metadata: t.getDataValue('metadata'),
        status: t.getDataValue('status'),
        adminId: t.getDataValue('adminId'),
        admin: t.Admin ? {
          id: t.Admin.getDataValue('id'),
          name: t.Admin.getDataValue('name'),
          email: t.Admin.getDataValue('email')
        } : null,
        createdAt: t.getDataValue('createdAt'),
        updatedAt: t.getDataValue('updatedAt')
      }))
    } catch (error) {
      console.error('Failed to fetch all transactions:', error)
      throw error
    }
  }

  /**
   * Get transaction summary for user
   */
  static async getUserTransactionSummary(userId: number, period?: 'today' | 'week' | 'month' | 'year') {
    try {
      const where: any = { userId }
      
      // Apply time period filter
      if (period) {
        const now = new Date()
        const startDate = new Date()
        
        switch (period) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        where.createdAt = { $gte: startDate }
      }
      
      const transactions = await TransactionLog.findAll({
        where,
        order: [['createdAt', 'ASC']]
      })
      
      const summary = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalPayments: 0,
        totalRefunds: 0,
        totalListingFees: 0,
        totalFeatureFees: 0,
        totalBidPayments: 0,
        firstTransaction: null as any,
        lastTransaction: null as any,
        transactionCount: transactions.length,
        netChange: 0
      }
      
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount.toString())
        const type = transaction.getDataValue('type')
        
        switch (type) {
          case 'deposit':
            summary.totalDeposits += amount
            summary.netChange += amount
            break
          case 'refund':
            summary.totalRefunds += amount
            summary.netChange += amount
            break
          case 'withdrawal':
          case 'payment':
            summary.totalWithdrawals += Math.abs(amount)
            summary.netChange += amount // amount is negative
            break
          case 'listing_fee':
          case 'auction_fee':
            summary.totalListingFees += Math.abs(amount)
            summary.netChange += amount
            break
          case 'feature_payment':
          case 'permanent_feature_payment':
            summary.totalFeatureFees += Math.abs(amount)
            summary.netChange += amount
            break
          case 'bid_payment':
            summary.totalBidPayments += Math.abs(amount)
            summary.netChange += amount
            break
        }
      })
      
      if (transactions.length > 0) {
        summary.firstTransaction = transactions[transactions.length - 1]
        summary.lastTransaction = transactions[0]
      }
      
      return summary
    } catch (error) {
      console.error('Failed to get transaction summary:', error)
      throw error
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(transactionId: number) {
    try {
      const transaction = await TransactionLog.findByPk(transactionId, {
        include: [
          {
            association: 'User',
            attributes: ['id', 'name', 'email', 'role', 'funds']
          },
          {
            association: 'Admin',
            attributes: ['id', 'name', 'email']
          }
        ]
      })
      
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`)
      }
      
      return {
        id: transaction.getDataValue('id'),
        userId: transaction.getDataValue('userId'),
        user: transaction.User ? {
          id: transaction.User.getDataValue('id'),
          name: transaction.User.getDataValue('name'),
          email: transaction.User.getDataValue('email'),
          role: transaction.User.getDataValue('role'),
          currentBalance: parseFloat(transaction.User.getDataValue('funds')) || 0
        } : null,
        type: transaction.getDataValue('type'),
        amount: parseFloat(transaction.getDataValue('amount')),
        previousBalance: parseFloat(transaction.getDataValue('previousBalance')),
        newBalance: parseFloat(transaction.getDataValue('newBalance')),
        description: transaction.getDataValue('description'),
        referenceId: transaction.getDataValue('referenceId'),
        metadata: transaction.getDataValue('metadata'),
        status: transaction.getDataValue('status'),
        adminId: transaction.getDataValue('adminId'),
        admin: transaction.Admin ? {
          id: transaction.Admin.getDataValue('id'),
          name: transaction.Admin.getDataValue('name'),
          email: transaction.Admin.getDataValue('email')
        } : null,
        createdAt: transaction.getDataValue('createdAt'),
        updatedAt: transaction.getDataValue('updatedAt')
      }
    } catch (error) {
      console.error('Failed to get transaction:', error)
      throw error
    }
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(transactionId: number, status: 'pending' | 'completed' | 'failed' | 'refunded', adminId?: number) {
    try {
      const transaction = await TransactionLog.findByPk(transactionId)
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`)
      }
      
      await transaction.update({
        status,
        adminId: adminId || transaction.getDataValue('adminId')
      })
      
      console.log(`✅ Transaction ${transactionId} status updated to ${status}`)
      
      return transaction
    } catch (error) {
      console.error('Failed to update transaction status:', error)
      throw error
    }
  }
}