// server/api/vehicles/lookup.post.ts
//
// This file was EMPTY (0 bytes), which meant Nitro registered a route whose
// handler had no default export — every call returned an opaque 500.
// It now does what its name says: look one Typenschein number up in the cache.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const nr = String(body?.nr || body?.typenscheinNr || body?.number || '').trim()

  if (!nr) {
    throw createError({ statusCode: 400, statusMessage: 'A Typenschein number is required' })
  }

  const supabase = getSupabaseAdmin()

  // Try the number exactly as typed first — the cache stores it verbatim and
  // upper-casing blindly misses any row that is not already upper-case.
  const lookup = (value: string) => supabase
    .from('typenschein_cache')
    .select('nr, typenbezeichnung, fahrzeugart, data')
    .eq('nr', value)
    .maybeSingle()

  let { data, error } = await lookup(nr)
  if (!error && !data && nr !== nr.toUpperCase()) {
    ({ data, error } = await lookup(nr.toUpperCase()))
  }

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Lookup failed' })
  }
  if (!data) {
    return { found: false, nr, message: `Typenschein ${nr} was not found.` }
  }

  return {
    found: true,
    nr: data.nr,
    typenbezeichnung: data.typenbezeichnung,
    fahrzeugart: data.fahrzeugart,
    data: data.data,
  }
})
