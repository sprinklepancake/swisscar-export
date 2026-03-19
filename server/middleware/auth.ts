// server/middleware/auth.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // Always set defaults
  event.context.user = null
  event.context.auth = null

  // ─── Read token from Authorization header OR cookies ───────────────────────
  // adminFetch() in the frontend sends: Authorization: Bearer <token>
  // Regular page loads send it as a cookie (sb-access-token)
  // We support both so both paths work.
  const authHeader = getHeader(event, 'authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const token =
    bearerToken ||
    getCookie(event, 'sb-access-token') ||
    getCookie(event, 'sb_access_token') ||
    getCookie(event, 'access_token')

  if (!token) return

  try {
    const supabase = getSupabaseAdmin()
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)

    if (error || !authUser) return

    // Fetch profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, role, funds, verified, banned, phone, company_name, profile_image, created_at')
      .eq('auth_uid', authUser.id)
      .single()

    if (!profile) return

    const userData = {
      id: profile.id,
      authUid: authUser.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      funds: parseFloat(profile.funds || 0),
      verified: profile.verified || false,
      banned: profile.banned || false,
      phone: profile.phone || '',
      companyName: profile.company_name || '',
      profileImage: profile.profile_image || '',
      createdAt: profile.created_at,
    }

    event.context.user = userData
    event.context.auth = userData
  } catch (error) {
    // Non-fatal — unauthenticated requests are fine for public routes
    console.error('Auth middleware error:', error) // Added for debugging
  }
})