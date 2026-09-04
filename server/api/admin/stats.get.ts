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
      { count: pendingAuctionUsers },
      { count: restrictedUsers },
      { count: bannedUsers },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      // The admin's actual work queue: accounts waiting for a human to look at
      // their ID. Signing up no longer needs approval, so counting
      // `verified = false` counted nothing useful.
      //
      // This MUST match pendingUsers() in pages/admin.vue and the partial index
      // in migration 0004, or the stat card and the "N accounts waiting" banner
      // show different numbers on the same screen.
      //
      // BOTH conditions are required. id_document_url alone would drag in the
      // entire legacy user base, because under the old rules every account
      // uploaded a document. buyer_type alone would list accounts with nothing
      // to review, whose Approve button is disabled. /api/user/upload-id sets
      // buyer_type='auction' as it stores the file, so the two cannot drift.
      supabase.from('users').select('*', { count: 'exact', head: true })
        .eq('verified_buyer', false).eq('banned', false)
        .eq('buyer_type', 'auction').not('id_document_url', 'is', null),
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
        // Kept under the old key so the admin panel's StatCard binding and any
        // cached client bundle keep working; it now means "awaiting auction
        // approval", which is what the tile is labelled.
        unverifiedUsers: pendingAuctionUsers || 0,
        pendingAuctionUsers: pendingAuctionUsers || 0,
        restrictedUsers: restrictedUsers || 0,
        bannedUsers: bannedUsers || 0,
        todaysRevenue: 0,
      },
    }
  } catch {
    return { success: false, error: 'Failed to fetch stats', stats: { totalUsers: 0, totalBuyers: 0, totalSellers: 0, totalAdmins: 0, activeListings: 0, unverifiedUsers: 0, pendingAuctionUsers: 0, restrictedUsers: 0, bannedUsers: 0, todaysRevenue: 0 } }
  }
})
