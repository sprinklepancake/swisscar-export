// server/api/database-reset.post.ts
// Old SQLite database reset endpoint - no longer applicable with Supabase
export default defineEventHandler(async () => {
  return {
    success: false,
    message: 'This endpoint is not applicable. The app now uses Supabase PostgreSQL. Manage your database via the Supabase dashboard.'
  }
})
