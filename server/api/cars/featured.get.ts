// server/api/cars/featured.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        id, make, model, year, price, mileage, fuel_type, transmission, condition,
        images, city, canton, status, listing_type, current_bid, starting_price,
        is_featured, featured_until, permanent_feature, created_at,
        seller:users!seller_id (id, name, email, phone, company_name)
      `)
      .eq('is_featured', true)
      .eq('status', 'active')
      .or(`permanent_feature.eq.true,featured_until.gt.${now}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      cars: (cars || []).map((car: any) => ({
        id: car.id, make: car.make, model: car.model, year: car.year,
        price: car.price, mileage: car.mileage, fuelType: car.fuel_type,
        transmission: car.transmission, condition: car.condition,
        images: car.images || [], city: car.city, canton: car.canton,
        status: car.status, listingType: car.listing_type,
        currentBid: car.current_bid, startingPrice: car.starting_price,
        isFeatured: car.is_featured, featuredUntil: car.featured_until,
        permanentFeature: car.permanent_feature,
        seller: car.seller,
      })),
    }
  } catch (error: any) {
    console.error('Featured cars error:', error)
    return { success: false, cars: [] }
  }
})
