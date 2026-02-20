// server/api/auth/reset-password.post.ts
// Password reset is handled by Supabase Auth via the forgot-password flow.
// Supabase sends a reset link; the client uses supabase.auth.updateUser({ password }) on the reset page.
export default defineEventHandler(async () => {
  throw createError({
    statusCode: 410,
    statusMessage: 'Password reset is handled client-side via Supabase Auth.'
  })
})
