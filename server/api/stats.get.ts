// server/api/stats.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const [{ count: totalCars }, { count: activeCars }, { count: totalUsers }, { count: totalBids }] = await Promise.all([
      supabase.from('cars').select('*', { count: 'exact', head: true }),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('bids').select('*', { count: 'exact', head: true }),
    ])
    return { success: true, stats: { totalCars, activeCars, totalUsers, totalBids } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
