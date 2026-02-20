// server/api/cars/sync.post.ts
// This endpoint was only needed to sync from JSON files to SQLite.
// Now that everything is in Supabase, it is no longer needed.
export default defineEventHandler(async () => {
  return { success: true, message: 'Sync not needed - all data is in Supabase.' }
})
