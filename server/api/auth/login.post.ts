// server/api/auth/login.post.ts
// Login is handled client-side by Supabase in useAuth().login()
// This endpoint exists as a no-op fallback for any old code that still calls it
export default defineEventHandler(async () => {
  throw createError({
    statusCode: 410,
    statusMessage: 'This endpoint is no longer used. Login is handled client-side via Supabase.',
  })
})
