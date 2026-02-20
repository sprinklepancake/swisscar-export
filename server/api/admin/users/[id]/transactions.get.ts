// server/api/admin/users/[id]/transactions.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: transactions, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return {
      success: true,
      transactions: (transactions || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        previousBalance: parseFloat(t.previous_balance) || 0,
        newBalance: parseFloat(t.new_balance) || 0,
        description: t.description || '',
        referenceId: t.reference_id || '',
        createdAt: t.created_at,
      })),
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch transactions' })
  }
})