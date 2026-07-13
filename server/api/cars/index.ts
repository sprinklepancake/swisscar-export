// server/api/cars/index.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

// Only the columns the LIST/card view needs. Deliberately excludes heavy,
// detail-only fields — especially `typenschein_data` (a large JSON blob per
// row) plus `description`, `additional_features`, etc. Selecting `*` used to
// pull all of those for every car, bloating the payload many times over.
const LIST_COLUMNS = [
  'id', 'make', 'model', 'year', 'price', 'starting_price', 'reserve_price',
  'mileage', 'fuel_type', 'transmission', 'body_type', 'drive_type', 'condition',
  'engine_size', 'power', 'power_ps', 'power_kw', 'cylinders', 'doors', 'seats',
  'color_exterior', 'color_interior', 'equipment', 'canton', 'city', 'zip_code',
  'seller_type', 'export_documents', 'with_warranty', 'valid_inspection',
  'has_accident', 'images', 'status', 'listing_type', 'is_featured',
  'featured_until', 'permanent_feature', 'current_bid', 'bid_count',
  'auction_end', 'views', 'vehicle_type', 'created_at',
].join(', ')

// Map an incoming filter query key -> DB column for simple equality filters.
const EQ_FILTERS: Record<string, string> = {
  make: 'make', model: 'model', fuelType: 'fuel_type', transmission: 'transmission',
  bodyType: 'body_type', driveType: 'drive_type', condition: 'condition',
  sellerType: 'seller_type', canton: 'canton', colorExterior: 'color_exterior',
  colorInterior: 'color_interior', doors: 'doors', seats: 'seats',
  cylinders: 'cylinders', vehicleType: 'vehicle_type',
}

const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

function toCamel(row: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const k in row) out[snakeToCamel(k)] = row[k]
  return out
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseAdmin()
    const q = getQuery(event)

    // ── Pagination (optional). Backstop limit protects against unbounded payloads.
    const limit = Math.min(Number(q.limit) || 200, 500)
    const page = Math.max(Number(q.page) || 1, 1)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('cars')
      .select(LIST_COLUMNS)
      .order('created_at', { ascending: false })

    // Status: default to active listings; allow override (e.g. auction).
    query = query.eq('status', (q.status as string) || 'active')

    if (q.featured === 'true' || q.featured === '1') query = query.eq('is_featured', true)

    // ── Optional server-side filters (applied only when provided) ───────────
    for (const key in EQ_FILTERS) {
      const v = q[key]
      if (v !== undefined && v !== '' && v !== 'all') query = query.eq(EQ_FILTERS[key], v as string)
    }
    if (q.priceMin) query = query.gte('price', Number(q.priceMin))
    if (q.priceMax) query = query.lte('price', Number(q.priceMax))
    if (q.yearMin) query = query.gte('year', Number(q.yearMin))
    if (q.yearMax) query = query.lte('year', Number(q.yearMax))
    if (q.mileageMin) query = query.gte('mileage', Number(q.mileageMin))
    if (q.mileageMax) query = query.lte('mileage', Number(q.mileageMax))
    if (q.withWarranty === 'true') query = query.eq('with_warranty', true)
    if (q.validInspection === 'true') query = query.eq('valid_inspection', true)

    query = query.range(from, to)

    const { data: cars, error } = await query
    if (error) throw error

    // camelCase to match the card template + the /api/cars/featured contract.
    return (cars || []).map(toCamel)
  } catch (error: any) {
    console.error('Error fetching cars:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch cars' })
  }
})
