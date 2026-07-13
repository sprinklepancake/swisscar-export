// server/api/cars/create.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

// Columns that are NOT NULL in the DB. If any is missing the insert 500s with
// a cryptic error, so we check them here and return a clear message instead.
const REQUIRED = ['make', 'model', 'year', 'mileage', 'fuelType', 'transmission', 'canton', 'city', 'zipCode'] as const
const CONDITIONS = ['excellent', 'good', 'fair', 'poor']

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
  if (!user.verified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account must be verified before you can post listings. Please wait for admin verification.',
    })
  }

  try {
    const body = await readBody(event)

    if (!body || typeof body !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Request body is missing or invalid. Ensure Content-Type is application/json.' })
    }

    // ── Validate NOT NULL columns up front, name the culprit clearly ────
    const missing = REQUIRED.filter((k) => {
      const v = (body as any)[k]
      return v === undefined || v === null || v === ''
    })
    if (missing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required field(s): ${missing.join(', ')}. Please complete the form before publishing.`,
      })
    }

    const supabase = getSupabaseAdmin()

    // ── Free-period check (first 6 months) ─────────────────────────────
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

    if (!isFirstSixMonths) {
      const currentFunds = parseFloat(sellerProfile?.funds || 0)
      if (currentFunds < listingFee) {
        throw createError({
          statusCode: 402,
          statusMessage: `Insufficient funds. You need ${listingFee} CHF to post a listing. Current balance: ${currentFunds} CHF`,
        })
      }
    }

    // ── Auction end ────────────────────────────────────────────────────
    let auctionEndDate: string | null = null
    if (listingType === 'auction') {
      const durationDays = body.auctionDurationDays || 7
      const endDate = new Date()
      endDate.setHours(endDate.getHours() + durationDays * 24)
      auctionEndDate = endDate.toISOString()
    }

    // ── Normalise power; write to every power column the app reads ──────
    const powerPs = body.power ? parseInt(body.power) : null
    const powerKw = powerPs ? Math.round(powerPs / 1.36) : null

    // ── Keep condition inside the DB CHECK constraint ──────────────────
    const condition = CONDITIONS.includes(body.condition) ? body.condition : 'good'

    const carData = {
      seller_id: user.id,
      make: body.make,
      model: body.model,
      year: parseInt(body.year),
      price: body.price ? parseFloat(body.price) : null,
      starting_price: body.startingPrice ? parseFloat(body.startingPrice) : null,
      reserve_price: body.reservePrice ? parseFloat(body.reservePrice) : null,
      mileage: parseInt(body.mileage),
      fuel_type: body.fuelType,
      transmission: body.transmission,
      engine_size: body.engineSize || null,
      power: powerPs,
      power_ps: powerPs,
      power_kw: powerKw,
      drive_type: body.driveType || null,
      body_type: body.bodyType || null,
      condition,
      color: body.colorExterior || body.color || null,
      color_exterior: body.colorExterior || null,
      color_interior: body.colorInterior || null,
      doors: body.doors ? parseInt(body.doors) : null,
      seats: body.seats ? parseInt(body.seats) : null,
      cylinders: body.cylinders ? parseInt(body.cylinders) : null,
      weight_empty: body.weightEmpty || null,
      weight_total: body.weightTotal || null,
      canton: body.canton,
      city: body.city,
      zip_code: body.zipCode,
      street_address: body.streetAddress || null,
      seller_type: body.sellerType || null,
      seller_name: body.sellerName || user.name,
      seller_email: body.sellerEmail || user.email,
      seller_phone: body.sellerPhone || null,
      description: body.description || '',
      images: Array.isArray(body.images) ? body.images : [],
      equipment: Array.isArray(body.equipment) ? body.equipment : [],
      vin: body.vin || null,
      first_registration: body.firstRegistration || null,
      additional_features: body.additionalFeatures || null,
      typenschein_nr: body.typenscheinNr || null,
      typenschein_data: body.typenscheinData || null,
      vehicle_type: body.vehicleType || null,
      export_documents: !!body.exportDocuments,
      with_warranty: !!body.withWarranty,
      valid_inspection: !!body.validInspection,
      has_accident: !!body.hasAccident,
      listing_type: listingType,
      status: listingType === 'auction' ? 'auction' : 'active',
      is_featured: false,
      auction_end: auctionEndDate,
      current_bid: null,
      bid_count: 0,
      views: 0,
      listing_fee_paid: isFirstSixMonths ? 0 : listingFee,
    }

    const { data: newCar, error: carError } = await supabase
      .from('cars')
      .insert(carData)
      .select()
      .single()

    if (carError) {
      // Surface the REAL Postgres reason — this is what was missing before.
      console.error('[cars/create] Supabase insert failed:', {
        message: carError.message,
        details: carError.details,
        hint: carError.hint,
        code: carError.code,
      })
      throw createError({
        statusCode: 400,
        statusMessage: `Could not save listing: ${carError.message}${carError.details ? ' — ' + carError.details : ''}`,
      })
    }

    if (!isFirstSixMonths) {
      const currentFunds = parseFloat(sellerProfile?.funds || 0)
      const newBalance = currentFunds - listingFee
      await supabase.from('users').update({ funds: newBalance }).eq('id', user.id)
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
    console.error('[cars/create] Error creating car listing:', error?.message || error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Internal server error' })
  }
})