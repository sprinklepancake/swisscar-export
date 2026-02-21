// server/api/vehicles/search.post.ts
// Replaced legacy sqlite3 implementation with Supabase query.
// Vehicle data is now served from the typenschein_cache table in Supabase.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { query, marke, limit = 50 } = body

    // Support both old 'marke' field and new 'query' field
    const searchTerm = (query || marke || '').trim()

    if (!searchTerm || searchTerm.length < 2) {
      return { results: [], vehicles: [] }
    }

    const supabase = getSupabaseAdmin()

    // Search typenschein_cache by typenbezeichnung (make/model name)
    const { data, error } = await supabase
      .from('typenschein_cache')
      .select('nr, typenbezeichnung, fahrzeugart, data')
      .or(
        `typenbezeichnung.ilike.%${searchTerm}%,fahrzeugart.ilike.%${searchTerm}%,nr.ilike.%${searchTerm}%`
      )
      .limit(limit)

    if (error) {
      console.error('Vehicle search error:', error)
      return { results: [], vehicles: [], error: 'Search failed' }
    }

    const results = (data || []).map((row: any) => ({
      nr: row.nr,
      name: row.typenbezeichnung,
      typenbezeichnung: row.typenbezeichnung,
      fahrzeugart: row.fahrzeugart,
      // Expose key fields from the full data blob
      make: row.data?.BaseData_DE?.Typenbezeichnung?.split(' ')[0] || '',
      model: row.typenbezeichnung,
      treibstoff: row.data?.BaseData_DE?.Treibstoffcode,
      kw: row.data?.BaseData_DE?.Kw,
    }))

    return { results, vehicles: results }
  } catch (error: any) {
    console.error('Search error:', error)
    return { results: [], vehicles: [], error: 'Search failed' }
  }
})