// server/api/user/profile.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Please login to view your profile' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, role, funds, verified, verified_buyer, banned, phone, company_name, business_type, canton, city, zip_code, country, tax_id, street_address, profile_image, created_at, free_feature_credits, buyer_type, id_document_url')
      .eq('id', user.id)
      .single()

    if (!profile) throw createError({ statusCode: 404, statusMessage: 'Profile not found' })

    // Get stats
    let stats = { carsSold: 0, activeListings: 0, totalListings: 0, watchlistCount: 0 }
    if (profile.role === 'seller') {
      const [{ count: active }, { count: sold }, { count: total }] = await Promise.all([
        // 'auction' is a live listing too — counting only 'active' told sellers
        // they had fewer live listings than they actually did.
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).in('status', ['active', 'auction']),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'sold'),
        supabase.from('cars').select('*', { count: 'exact', head: true }).eq('seller_id', user.id),
      ])
      stats = { carsSold: sold || 0, activeListings: active || 0, totalListings: total || 0, watchlistCount: 0 }
    } else {
      const { count: watchlistCount } = await supabase.from('watchlists').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      stats.watchlistCount = watchlistCount || 0
    }

    // Get recent activity
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('id, description, created_at, type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const activity = (activityLogs || []).map((a: any) => ({ id: a.id, message: a.description, date: a.created_at, type: a.type }))

    // Get user listings
    const { data: listings } = await supabase
      .from('cars')
      .select('id, make, model, year, price, mileage, city, canton, images, status, listing_type, is_featured, featured_until, current_bid, bid_count, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    return {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        joinedAt: profile.created_at,
        funds: parseFloat(profile.funds || 0),
        verified: profile.verified || false,
        // Auction access is separate from `verified`: an ordinary account is
        // usable immediately, bidding is what an admin still approves by hand.
        verifiedBuyer: profile.verified_buyer || false,
        banned: profile.banned || false,
        phone: profile.phone || '',
        companyName: profile.company_name || '',
        businessType: profile.business_type || '',
        canton: profile.canton || '',
        city: profile.city || '',
        zipCode: profile.zip_code || '',
        streetAddress: profile.street_address || '',
        profileImage: profile.profile_image || '',
        freeFeatureCredits: profile.free_feature_credits || 0,
        buyerType: profile.buyer_type || 'direct',
        // Only whether a document exists — never the storage path itself.
        hasIdDocument: !!profile.id_document_url,
      },
      stats,
      activity,
      listings: (listings || []).map((c: any) => ({
        id: c.id, make: c.make, model: c.model, year: c.year, price: c.price,
        mileage: c.mileage ?? 0, city: c.city || '', canton: c.canton || '',
        images: c.images || [], status: c.status, listingType: c.listing_type,
        isFeatured: c.is_featured, featuredUntil: c.featured_until,
        currentBid: c.current_bid, bidCount: c.bid_count || 0, createdAt: c.created_at,
      })),
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to load profile data' })
  }
})
