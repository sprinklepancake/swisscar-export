// server/api/typenschein/create-index.post.ts
// Legacy endpoint that created a local JSON index from a local file.
// No longer applicable — typenschein data is now stored in Supabase.
// Use POST /api/typenschein/import to import data into Supabase instead.
export default defineEventHandler(async () => {
  return {
    success: false,
    message: 'This endpoint is deprecated. Typenschein data is now stored in Supabase.',
    alternative: 'Use POST /api/typenschein/import to import records into the typenschein_cache table.',
    importScript: 'Or run: node scripts/import-typenscheine.mjs from your local machine.'
  }
})