// server/api/auth/verify-email.get.ts
// Email verification is handled by Supabase automatically.
export default defineEventHandler(async () => {
  return { success: true, message: 'Email verification is handled by Supabase.' }
})
