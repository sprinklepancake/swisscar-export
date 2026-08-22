// server/api/cars/[id]/update.post.ts
//
// Sellers had "Edit" buttons in three places (profile, dashboard, my-cars) and
// all three pointed at a route that never existed. Nothing on the whole site
// could change a listing after it was published — a wrong price meant deleting
// the listing and paying the fee again.
//
// This deliberately allows only the fields a seller should be able to correct
// after the fact. Make, model, year, VIN and listing type stay fixed: changing
// those would turn one advert into a different car underneath any buyer who had
// already messaged or bid on it.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireVerified } from '~/server/utils/auth'

const CONDITIONS = ['excellent', 'good', 'fair', 'poor']

const toNumberOrNull = (v: any) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default defineEventHandler(async (event) => {
  const user = await requireVerified(event, 'edit listings')

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const body = (await readBody(event)) || {}
  const supabase = getSupabaseAdmin()

  const { data: car } = await supabase
    .from('cars')
    .select('id, seller_id, listing_type, status, bid_count, starting_price, reserve_price')
    .eq('id', carId)
    .single()

  if (!car) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })
  if (car.seller_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'This is not your listing.' })
  }

  const update: Record<string, any> = {}

  // ── Price ─────────────────────────────────────────────────────────────────
  if (car.listing_type === 'auction') {
    const requested = body.startingPrice === undefined ? null : toNumberOrNull(body.startingPrice)
    const current = toNumberOrNull(car.starting_price)
    const changed = body.startingPrice !== undefined && requested !== current

    // Once somebody has bid, the starting price is part of a deal in progress.
    // Compare values rather than mere presence: the edit form always sends the
    // field, so checking `!== undefined` rejected every edit to a live auction.
    if ((car.bid_count || 0) > 0 && changed) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This auction already has bids, so the starting price can no longer be changed.',
      })
    }
    if (changed) update.starting_price = requested

    // The reserve is part of the same deal — freeze it once bids exist too.
    const reserveRequested = body.reservePrice === undefined ? null : toNumberOrNull(body.reservePrice)
    const reserveChanged = body.reservePrice !== undefined && reserveRequested !== toNumberOrNull((car as any).reserve_price)
    if ((car.bid_count || 0) > 0 && reserveChanged) {
      throw createError({
        statusCode: 400,
        statusMessage: 'This auction already has bids, so the reserve price can no longer be changed.',
      })
    }
    if (reserveChanged) update.reserve_price = reserveRequested
  } else if (body.price !== undefined) {
    update.price = toNumberOrNull(body.price)
  }

  // ── Straightforward corrections ───────────────────────────────────────────
  if (body.mileage !== undefined) {
    const mileage = toNumberOrNull(body.mileage)
    if (mileage === null || mileage < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Please enter a valid mileage.' })
    }
    update.mileage = Math.round(mileage)
  }
  if (body.description !== undefined) update.description = String(body.description).slice(0, 5000)
  if (body.condition !== undefined && CONDITIONS.includes(body.condition)) update.condition = body.condition
  if (body.colorExterior !== undefined) update.color_exterior = body.colorExterior || null
  if (body.colorInterior !== undefined) update.color_interior = body.colorInterior || null
  if (body.canton !== undefined && body.canton) update.canton = body.canton
  if (body.city !== undefined && body.city) update.city = body.city
  if (body.zipCode !== undefined && body.zipCode) update.zip_code = body.zipCode
  if (body.streetAddress !== undefined) update.street_address = body.streetAddress || null
  if (body.sellerPhone !== undefined) update.seller_phone = body.sellerPhone || null
  if (body.sellerName !== undefined && body.sellerName) update.seller_name = body.sellerName
  if (body.sellerEmail !== undefined && body.sellerEmail) update.seller_email = body.sellerEmail

  for (const flag of ['exportDocuments', 'withWarranty', 'validInspection', 'hasAccident'] as const) {
    if (body[flag] !== undefined) {
      const column = flag.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
      update[column] = !!body[flag]
    }
  }

  if (Array.isArray(body.images)) {
    update.images = body.images.filter((u: any) => typeof u === 'string' && u.startsWith('http')).slice(0, 20)
  }
  if (Array.isArray(body.equipment)) {
    update.equipment = body.equipment.filter((e: any) => typeof e === 'string').slice(0, 100)
  }

  if (Object.keys(update).length === 0) {
    return { success: true, message: 'Nothing to update' }
  }

  const { data: updated, error } = await supabase
    .from('cars')
    .update(update)
    .eq('id', carId)
    .select('id')
    .single()

  if (error || !updated) {
    console.error('[cars/update] failed:', error)
    throw createError({ statusCode: 400, statusMessage: `Could not save the listing: ${error?.message || 'unknown error'}` })
  }

  return { success: true, message: 'Listing updated', carId: updated.id }
})
