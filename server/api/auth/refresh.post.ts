// server/api/auth/refresh.post.ts
// Supabase handles token refresh automatically on the client.
// This stub prevents 404 errors if anything still calls this route.
export default defineEventHandler(async () => {
  return { success: true, message: 'Token refresh is handled by Supabase client.' }
})
