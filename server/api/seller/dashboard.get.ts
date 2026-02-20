// server/api/seller/dashboard.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (user.role !== 'seller' && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Seller access only' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Get full user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get seller's cars
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    const allCars = cars || []

    const activeListings = allCars.filter((c: any) => c.status === 'active' || c.status === 'auction').length
    const soldCars = allCars.filter((c: any) => c.status === 'sold').length

    const totalEarnings = allCars
      .filter((c: any) => c.status === 'sold')
      .reduce((sum: number, c: any) => sum + parseFloat(c.price || 0), 0)

    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)

    const monthlyEarnings = allCars
      .filter((c: any) => c.status === 'sold' && new Date(c.updated_at) > oneMonthAgo)
      .reduce((sum: number, c: any) => sum + parseFloat(c.price || 0), 0)

    const recentSales = allCars
      .filter((c: any) => c.status === 'sold')
      .slice(0, 5)
      .map((c: any) => ({
        id: c.id,
        car: `${c.make} ${c.model}`,
        price: c.price,
        date: c.updated_at,
      }))

    const listings = allCars.map((c: any) => ({
      id: c.id,
      make: c.make,
      model: c.model,
      year: c.year,
      price: c.price,
      starting_price: c.starting_price,
      status: c.status,
      views: c.views || 0,
      is_featured: c.is_featured && c.featured_until && new Date(c.featured_until) > new Date(),
      listing_type: c.listing_type,
      auction_end: c.auction_end,
      current_bid: c.current_bid,
      bid_count: c.bid_count || 0,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))

    return {
      user: {
        name: profile?.name || user.name,
        funds: parseFloat(profile?.funds || 0),
      },
      stats: {
        activeListings,
        totalCars: allCars.length,
        totalEarnings,
        monthlyEarnings,
        soldCars,
      },
      recentSales,
      listings,
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})
