// server/api/cars/my.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, make, model, year, price, mileage, images, city, canton, status, listing_type, current_bid, starting_price, is_featured, created_at, views')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      cars: (cars || []).map((car: any) => ({
        id: car.id, make: car.make, model: car.model, year: car.year,
        price: car.price, mileage: car.mileage, images: car.images || [],
        city: car.city, canton: car.canton, status: car.status,
        listingType: car.listing_type, currentBid: car.current_bid,
        startingPrice: car.starting_price, isFeatured: car.is_featured,
        createdAt: car.created_at, views: car.views || 0,
      })),
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch listings' })
  }
})
