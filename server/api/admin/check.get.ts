// server/api/admin/check.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Prefer the user already resolved by server/middleware/auth.ts
    const ctxUser = event.context.user
    if (ctxUser) {
      return {
        isAdmin: ctxUser.role === 'admin',
        authenticated: true,
        user: ctxUser,
      }
    }

    // Fallback: read cookie directly (handles both name variants)
    const token =
      getCookie(event, 'sb-access-token') ||
      getCookie(event, 'sb_access-token') ||
      getCookie(event, 'access_token')

    if (!token) return { isAdmin: false, authenticated: false }

    const supabase = getSupabaseAdmin()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authUser) return { isAdmin: false, authenticated: false }

    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, role, funds')
      .eq('auth_uid', authUser.id)
      .single()

    if (!profile) return { isAdmin: false, authenticated: false }

    return {
      isAdmin: profile.role === 'admin',
      authenticated: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        funds: parseFloat(profile.funds || 0),
      },
    }
  } catch {
    return { isAdmin: false, authenticated: false }
  }
})