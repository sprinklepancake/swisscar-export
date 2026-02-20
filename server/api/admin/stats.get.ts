// server/api/admin/stats.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()
    const [
      { count: totalUsers },
      { count: totalBuyers },
      { count: totalSellers },
      { count: activeListings },
      { count: unverifiedUsers },
      { count: bannedUsers },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('verified', false),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('banned', true),
    ])

    return {
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalBuyers: totalBuyers || 0,
        totalSellers: totalSellers || 0,
        totalAdmins: (totalUsers || 0) - (totalBuyers || 0) - (totalSellers || 0),
        activeListings: activeListings || 0,
        unverifiedUsers: unverifiedUsers || 0,
        bannedUsers: bannedUsers || 0,
        todaysRevenue: 0,
      },
    }
  } catch {
    return { success: false, error: 'Failed to fetch stats', stats: { totalUsers: 0, totalBuyers: 0, totalSellers: 0, totalAdmins: 0, activeListings: 0, unverifiedUsers: 0, bannedUsers: 0, todaysRevenue: 0 } }
  }
})
