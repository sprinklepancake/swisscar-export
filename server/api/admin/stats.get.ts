// server/api/admin/stats.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: users } = await supabase.from('users').select('id, role, verified, banned')
    const { data: cars } = await supabase.from('cars').select('id').eq('status', 'active')

    const allUsers = users || []

    return {
      success: true,
      stats: {
        totalUsers: allUsers.length,
        totalBuyers: allUsers.filter((u: any) => u.role === 'buyer').length,
        totalSellers: allUsers.filter((u: any) => u.role === 'seller').length,
        totalAdmins: allUsers.filter((u: any) => u.role === 'admin').length,
        activeListings: cars?.length || 0,
        unverifiedUsers: allUsers.filter((u: any) => !u.verified).length,
        bannedUsers: allUsers.filter((u: any) => u.banned).length,
        todaysRevenue: 0,
      },
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      success: false,
      error: 'Failed to fetch stats',
      stats: {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        activeListings: 0,
        unverifiedUsers: 0,
        bannedUsers: 0,
        todaysRevenue: 0,
      },
    }
  }
})
