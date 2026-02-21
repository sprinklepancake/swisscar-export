// server/api/database-reset.get.ts
// Legacy SQLite reset endpoint — no longer applicable with Supabase.
export default defineEventHandler(async () => {
  return {
    success: false,
    message: 'This endpoint is not applicable. The app now uses Supabase PostgreSQL.',
    hint: 'Manage your database via the Supabase dashboard at https://supabase.com'
  }
})