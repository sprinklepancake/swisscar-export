// server/api/auth/me.get.ts
import { verifySupabaseToken, getUserProfile } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'sb_access_token')

    if (!token) {
      return { user: null }
    }

    const authUser = await verifySupabaseToken(token)
    if (!authUser) {
      deleteCookie(event, 'sb_access_token')
      return { user: null }
    }

    const profile = await getUserProfile(authUser.id)
    if (!profile) {
      return { user: null }
    }

    return {
      user: {
        id: profile.id,
        auth_uid: authUser.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        funds: parseFloat(profile.funds || 0),
        banned: profile.banned || false,
        verified: profile.verified || false,
        company_name: profile.company_name,
        canton: profile.canton,
        city: profile.city,
      },
    }
  } catch (error) {
    return { user: null }
  }
})
