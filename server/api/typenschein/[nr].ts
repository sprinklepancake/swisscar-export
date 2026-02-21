// server/api/typenschein/[nr].ts
// Looks up a Typenschein number from Supabase cache.
// If not found in cache, returns 404 (local file loading is not available on Render).
// To populate the cache, use POST /api/typenschein/import or the admin import tool.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const nr = getRouterParam(event, 'nr')

  if (!nr) {
    throw createError({ statusCode: 400, statusMessage: 'Typenschein number is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('typenschein_cache')
      .select('data')
      .eq('nr', nr.trim())
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: `Typenschein ${nr} not found`,
      })
    }

    return data.data

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }
})