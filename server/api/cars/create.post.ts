// server/api/cars/create.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please log in.' })
  }

  if (user.role !== 'seller' && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Only sellers can create listings.' })
  }

  if (user.banned) {
    throw createError({ statusCode: 403, statusMessage: 'Your account has been banned.' })
  }

  const body = await readBody(event)

  if (!body.canton || !body.city || !body.zipCode) {
    throw createError({ statusCode: 400, statusMessage: 'Location fields (canton, city, ZIP) are required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Check if seller is in their free period (first 6 months)
    const { data: sellerProfile } = await supabase
      .from('users')
      .select('funds, created_at, free_feature_credits')
      .eq('id', user.id)
      .single()

    const sellerCreatedAt = sellerProfile?.created_at ? new Date(sellerProfile.created_at) : new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const isFirstSixMonths = sellerCreatedAt > sixMonthsAgo

    const listingType = body.listingType || 'normal'
    const listingFee = listingType === 'auction' ? 10 : 7.5

    // Check balance if not in free period
    if (!isFirstSixMonths) {
      const currentFunds = parseFloat(sellerProfile?.funds || 0)
      if (currentFunds < listingFee) {
        throw createError({
          statusCode: 402,
          statusMessage: `Insufficient funds. You need ${listingFee} CHF to post a listing. Current balance: ${currentFunds} CHF`,
        })
      }
    }

    // Calculate auction end if applicable
    let auctionEndDate: string | null = null
    if (listingType === 'auction') {
      const durationHours = body.auctionDuration || 72
      const endDate = new Date()
      endDate.setHours(endDate.getHours() + durationHours)
      auctionEndDate = endDate.toISOString()
    }

    // Build the car record (snake_case for Supabase)
    const carData = {
      seller_id: user.id,
      make: body.make,
      model: body.model,
      year: body.year ? parseInt(body.year) : null,
      price: body.price ? parseFloat(body.price) : null,
      starting_price: body.startingPrice ? parseFloat(body.startingPrice) : null,
      reserve_price: body.reservePrice ? parseFloat(body.reservePrice) : null,
      mileage: body.mileage ? parseInt(body.mileage) : null,
      fuel_type: body.fuelType || null,
      transmission: body.transmission || null,
      engine_size: body.engineSize || null,
      power: body.power ? parseInt(body.power) : null,
      drive_type: body.driveType || null,
      condition: body.condition || null,
      color: body.colorExterior || body.color || null,
      color_exterior: body.colorExterior || null,
      color_interior: body.colorInterior || null,
      canton: body.canton,
      city: body.city,
      zip_code: body.zipCode,
      description: body.description || '',
      images: body.images || [],
      equipment: body.equipment || [],
      vin: body.vin || null,
      first_registration: body.firstRegistration || null,
      additional_features: body.additionalFeatures || null,
      typenschein_nr: body.typenscheinNr || null,
      typenschein_data: body.typenscheinData || null,
      vehicle_type: body.vehicleType || null,
      export_documents: body.exportDocuments || [],
      listing_type: listingType,
      status: 'active',
      is_featured: false,
      auction_end: auctionEndDate,
      current_bid: null,
      bid_count: 0,
      views: 0,
      listing_fee_paid: isFirstSixMonths ? 0 : listingFee,
      seller_name: user.name,
      seller_email: user.email,
    }

    const { data: newCar, error: carError } = await supabase
      .from('cars')
      .insert(carData)
      .select()
      .single()

    if (carError) throw carError

    // Deduct listing fee if not free period
    if (!isFirstSixMonths) {
      const currentFunds = parseFloat(sellerProfile?.funds || 0)
      const newBalance = currentFunds - listingFee

      await supabase
        .from('users')
        .update({ funds: newBalance })
        .eq('id', user.id)

      // Log transaction
      await supabase.from('transaction_logs').insert({
        user_id: user.id,
        type: 'listing_fee',
        amount: -listingFee,
        description: `Listing fee for ${body.make} ${body.model}`,
        car_id: newCar.id,
        new_balance: newBalance,
      })
    }

    return {
      success: true,
      message: 'Car listing created successfully',
      car: newCar,
      listingType,
      freeListing: isFirstSixMonths,
      listingFee: isFirstSixMonths ? 0 : listingFee,
    }
  } catch (error: any) {
    console.error('Error creating car listing:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal server error' })
  }
})
