// server/api/cars/[id].ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: car, error } = await supabase
      .from('cars')
      .select(`
        *,
        seller:users!seller_id (
          id, name, email, phone, company_name, profile_image, verified, role
        )
      `)
      .eq('id', id)
      .single()

    if (error || !car) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    }

    // Increment views
    supabase
      .from('cars')
      .update({ views: (car.views || 0) + 1 })
      .eq('id', id)
      .then(() => {})

    // Map ALL snake_case DB columns to camelCase for the frontend
    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      startingPrice: car.starting_price,
      reservePrice: car.reserve_price,
      currentBid: car.current_bid,
      bidCount: car.bid_count || 0,
      mileage: car.mileage,
      // ✅ fuel type mapped
      fuelType: car.fuel_type,
      transmission: car.transmission,
      engineSize: car.engine_size,
      power: car.power,
      powerPs: car.power,
      driveType: car.drive_type,
      bodyType: car.body_type,
      condition: car.condition,
      color: car.color,
      // ✅ color fields mapped
      colorExterior: car.color_exterior || car.color,
      colorInterior: car.color_interior,
      doors: car.doors,
      seats: car.seats,
      cylinders: car.cylinders,
      vin: car.vin,
      firstRegistration: car.first_registration,
      weightEmpty: car.weight_empty,
      weightTotal: car.weight_total,
      // ✅ boolean fields mapped - these were all showing "No"
      withWarranty: car.with_warranty === true || car.with_warranty === 't' || car.with_warranty === 1,
      validInspection: car.valid_inspection === true || car.valid_inspection === 't' || car.valid_inspection === 1,
      exportDocuments: car.export_documents === true || car.export_documents === 't' || car.export_documents === 1,
      hasAccident: car.has_accident === true || car.has_accident === 't' || car.has_accident === 1,
      // Location
      canton: car.canton,
      city: car.city,
      zipCode: car.zip_code,
      streetAddress: car.street_address,
      // ✅ images mapped
      images: Array.isArray(car.images) ? car.images : (car.images ? [car.images] : []),
      // ✅ equipment/features mapped
      equipment: Array.isArray(car.equipment) ? car.equipment : [],
      // ✅ additional features (custom text) mapped
      additionalFeatures: car.additional_features || '',
      description: car.description || '',
      // Listing info
      listingType: car.listing_type,
      status: car.status,
      isFeatured: car.is_featured,
      featuredUntil: car.featured_until,
      permanentFeature: car.permanent_feature,
      auctionEnd: car.auction_end,
      // Typenschein
      typenscheinNr: car.typenschein_nr,
      typenscheinData: car.typenschein_data,
      vehicleType: car.vehicle_type,
      // Seller info
      sellerId: car.seller_id,
      sellerName: car.seller?.name || car.seller_name,
      sellerEmail: car.seller?.email || car.seller_email,
      sellerPhone: car.seller?.phone,
      sellerCompany: car.seller?.company_name,
      sellerVerified: car.seller?.verified,
      sellerRole: car.seller?.role,
      sellerImage: car.seller?.profile_image,
      seller: car.seller ? {
        id: car.seller.id,
        name: car.seller.name,
        email: car.seller.email,
        phone: car.seller.phone,
        companyName: car.seller.company_name,
        profileImage: car.seller.profile_image,
        verified: car.seller.verified,
        role: car.seller.role,
      } : null,
      // Meta
      views: car.views || 0,
      createdAt: car.created_at,
      updatedAt: car.updated_at,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch car' })
  }
})