// server/api/debug/transactions.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('transaction_logs')
      .select('*, user:users!user_id(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(100)

    return {
      success: true,
      total: data?.length || 0,
      transactions: (data || []).map((t: any) => ({
        id: t.id, userId: t.user_id, user: t.user?.name || 'Unknown',
        type: t.type, amount: parseFloat(t.amount) || 0,
        description: t.description, createdAt: t.created_at,
      })),
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
