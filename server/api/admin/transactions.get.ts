// server/api/admin/transactions.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const query = getQuery(event)

    let dbQuery = supabase
      .from('transaction_logs')
      .select(`
        *,
        user:users!user_id (id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (query.userId) dbQuery = dbQuery.eq('user_id', query.userId)
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
      createdAt: t.created_at,
      userId: t.user_id,
      adminId: t.admin_id,
      user: t.user,
    }))

    return { success: true, transactions: formatted, total: formatted.length }
  } catch (error: any) {
    console.error('Admin transactions error:', error)
    return { success: false, error: 'Failed to fetch transactions' }
  }
})
