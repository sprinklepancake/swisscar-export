// server/api/auth/forgot-password.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { LOCALE_CODES, DEFAULT_LOCALE } from '~/constants/locales'

export default defineEventHandler(async (event) => {
  const { email, locale } = await readBody(event)
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

  try {
    const config = useRuntimeConfig()
    const supabase = getSupabaseAdmin()

    // The redirect used to point at `${siteUrl}/reset-password`, which is a 404:
    // with the i18n 'prefix' strategy the page only exists at
    // /<locale>/reset-password. Every reset email therefore led nowhere.
    const code = (LOCALE_CODES as readonly string[]).includes(String(locale)) ? String(locale) : DEFAULT_LOCALE
    const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

    await supabase.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), {
      redirectTo: `${siteUrl}/${code}/reset-password`,
    })

    // Always return success so the response cannot be used to discover which
    // addresses have accounts.
    return { success: true }
  } catch {
    return { success: true }
  }
})
