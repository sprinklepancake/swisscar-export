// server/api/fix-permissions.get.ts
// Legacy SQLite permissions endpoint — no longer applicable with Supabase.
export default defineEventHandler(async () => {
  return {
    success: true,
    message: 'No local database to check. The app uses Supabase PostgreSQL.',
    hint: 'Check connection health at /api/check-models'
  }
})