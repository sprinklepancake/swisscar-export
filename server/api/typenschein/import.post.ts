// server/api/typenschein/import.post.ts
// One-time import endpoint: accepts the Typenschein JSON array in the request body
// and upserts all records into the typenschein_cache Supabase table.
//
// HOW TO USE:
//   Send a POST request with Content-Type: application/json
//   Body: { records: [ ...array of typenschein objects... ], adminKey: "your_admin_key" }
//
// You can split the JSON file into batches and call this multiple times.
// Each record must have { Nr, BaseData_DE: { Typenbezeichnung, Fahrzeugart, ... } }
//
// Example (from your terminal):
//   node scripts/import-typenscheine.mjs
//
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // Protect with a simple admin key
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { records, adminKey, batchSize = 500 } = body

  // Simple auth check
  const expectedKey = config.adminSetupKey || process.env.ADMIN_IMPORT_KEY
  if (expectedKey && adminKey !== expectedKey) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid admin key' })
  }

  if (!Array.isArray(records) || records.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'records array is required and must not be empty' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Map and validate records
    const rows = records
      .filter((r: any) => r.Nr && r.BaseData_DE)
      .map((r: any) => ({
        nr: r.Nr,
        data: r,
        typenbezeichnung: r.BaseData_DE?.Typenbezeichnung || null,
        fahrzeugart: r.BaseData_DE?.Fahrzeugart || null,
      }))

    if (rows.length === 0) {
      return { success: false, message: 'No valid records found (each needs Nr and BaseData_DE)' }
    }

    // Upsert in chunks to avoid request size limits
    let imported = 0
    const chunks = []
    for (let i = 0; i < rows.length; i += batchSize) {
      chunks.push(rows.slice(i, i + batchSize))
    }

    for (const chunk of chunks) {
      const { error } = await supabase
        .from('typenschein_cache')
        .upsert(chunk, { onConflict: 'nr' })

      if (error) {
        console.error('Upsert error:', error)
        return {
          success: false,
          message: `Import failed at record ${imported}: ${error.message}`,
          imported,
        }
      }
      imported += chunk.length
    }

    return {
      success: true,
      message: `Successfully imported ${imported} typenschein records`,
      imported,
      total: records.length,
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message || 'Import failed' })
  }
})