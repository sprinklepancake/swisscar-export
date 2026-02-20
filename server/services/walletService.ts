// server/services/walletService.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export class WalletService {
  static async addFunds(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error('Amount must be positive')
    if (amount > 10000) throw new Error('Maximum single transaction is 10,000 CHF')
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('funds').eq('id', userId).single()
    if (!user) throw new Error('User not found')
    const previousBalance = parseFloat(user.funds || 0)
    const newBalance = previousBalance + amount
    await supabase.from('users').update({ funds: newBalance }).eq('id', userId)
    await supabase.from('transaction_logs').insert({ user_id: userId, type: 'deposit', amount, previous_balance: previousBalance, new_balance: newBalance, description: description || 'Manual deposit' })
    return { success: true, newBalance, previousBalance }
  }

  static async deductFunds(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error('Amount must be positive')
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('funds').eq('id', userId).single()
    if (!user) throw new Error('User not found')
    const previousBalance = parseFloat(user.funds || 0)
    if (previousBalance < amount) throw new Error('Insufficient funds')
    const newBalance = previousBalance - amount
    await supabase.from('users').update({ funds: newBalance }).eq('id', userId)
    await supabase.from('transaction_logs').insert({ user_id: userId, type: 'withdrawal', amount: -amount, previous_balance: previousBalance, new_balance: newBalance, description: description || 'Car listing fee' })
    return { success: true, newBalance, previousBalance }
  }

  static async hasSufficientFunds(userId: number, amount: number): Promise<boolean> {
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('funds').eq('id', userId).single()
    return (parseFloat(user?.funds || 0)) >= amount
  }

  static async getBalance(userId: number): Promise<number> {
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('funds').eq('id', userId).single()
    return parseFloat(user?.funds || 0)
  }

  static async isInFreePeriod(userId: number): Promise<boolean> {
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('created_at').eq('id', userId).single()
    if (!user?.created_at) return false
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return new Date(user.created_at) > sixMonthsAgo
  }
}
