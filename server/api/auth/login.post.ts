// server/api/auth/login.post.ts
// Login is handled client-side via Supabase Auth JS SDK (useAuth composable)
// This stub exists to prevent 404 errors from any legacy calls
export default defineEventHandler(async () => {
  throw createError({
    statusCode: 410,
    statusMessage: 'Login is handled client-side via Supabase. Use the useAuth composable.'
  })
})
