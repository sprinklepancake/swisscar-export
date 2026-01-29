// server/services/walletService.ts - CREATE NEW FILE
import { User } from '~/server/database/models'
import { Op } from 'sequelize'

export class WalletService {
  static async addFunds(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error('Amount must be positive')
    if (amount > 10000) throw new Error('Maximum single transaction is 10,000 CHF')
    
    const user = await User.findByPk(userId)
    if (!user) throw new Error('User not found')
    
    const currentBalance = parseFloat(user.getDataValue('funds')) || 0
    const newBalance = currentBalance + amount
    
    await user.update({ funds: newBalance })
    
    console.log('Wallet transaction:', {
      userId, type: 'deposit', amount,
      previousBalance: currentBalance, newBalance,
      description: description || 'Manual deposit'
    })
    
    return { success: true, newBalance, previousBalance: currentBalance }
  }
  
  static async deductFunds(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error('Amount must be positive')
    
    const user = await User.findByPk(userId)
    if (!user) throw new Error('User not found')
    
    const currentBalance = parseFloat(user.getDataValue('funds')) || 0
    if (currentBalance < amount) throw new Error('Insufficient funds')
    
    const newBalance = currentBalance - amount
    await user.update({ funds: newBalance })
    
    console.log('Wallet transaction:', {
      userId, type: 'withdrawal', amount: -amount,
      previousBalance: currentBalance, newBalance,
      description: description || 'Car listing fee'
    })
    
    return { success: true, newBalance, previousBalance: currentBalance }
  }
  
  static async hasSufficientFunds(userId: number, amount: number): Promise<boolean> {
    const user = await User.findByPk(userId)
    if (!user) return false
    const currentBalance = parseFloat(user.getDataValue('funds')) || 0
    return currentBalance >= amount
  }
  
  static async getBalance(userId: number): Promise<number> {
    const user = await User.findByPk(userId)
    if (!user) return 0
    return parseFloat(user.getDataValue('funds')) || 0
  }
  
  static async isInFreePeriod(userId: number): Promise<boolean> {
    const user = await User.findByPk(userId)
    if (!user) return false
    const joinedDate = user.getDataValue('createdAt')
    if (!joinedDate) return false
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return new Date(joinedDate) > sixMonthsAgo
  }
}