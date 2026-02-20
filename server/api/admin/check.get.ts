// server/api/admin/check.get.ts
import { verifySupabaseToken, getUserProfile } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'sb_access_token')

    if (!token) return { isAdmin: false, authenticated: false }

    const authUser = await verifySupabaseToken(token)
    if (!authUser) return { isAdmin: false, authenticated: false }

    const profile = await getUserProfile(authUser.id)
    if (!profile) return { isAdmin: false, authenticated: false }

    const isAdmin = profile.role === 'admin'

    return {
      isAdmin,
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
