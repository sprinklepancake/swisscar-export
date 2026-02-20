// server/api/auth/forgot-password.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

  try {
    const supabase = getSupabaseAdmin()
    // Use Supabase built-in password reset - sends email automatically
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${useRuntimeConfig().public.siteUrl}/reset-password`,
    })
    // Always return success to avoid email enumeration
    return { success: true }
  } catch {
    return { success: true }
  }
})
