// server/api/user/transactions.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Please login to view transactions' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const query = getQuery(event)

    let dbQuery = supabase
      .from('transaction_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (query.type) dbQuery = dbQuery.eq('type', query.type)
    if (query.limit) dbQuery = dbQuery.limit(parseInt(query.limit as string))

    const { data: transactions, error } = await dbQuery

    if (error) throw error

    const formatted = (transactions || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount) || 0,
      previousBalance: parseFloat(t.previous_balance) || 0,
      newBalance: parseFloat(t.new_balance) || 0,
      description: t.description || '',
      referenceId: t.reference_id || '',
      metadata: t.metadata || {},
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))

    // Summary
    let totalDeposits = 0, totalWithdrawals = 0, netChange = 0
    formatted.forEach(t => {
      if (t.amount > 0) totalDeposits += t.amount
      else totalWithdrawals += Math.abs(t.amount)
      netChange += t.amount
    })

    return {
      success: true,
      transactions: formatted,
      summary: {
        totalDeposits,
        totalWithdrawals,
        netChange,
        transactionCount: formatted.length,
      },
    }
  } catch (error: any) {
    console.error('Transactions API error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to load transaction history' })
  }
})
