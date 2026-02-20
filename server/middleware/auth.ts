// server/middleware/auth.ts
// Reads the Supabase access token from a cookie and verifies it server-side.
// The client stores the token via useAuth composable after login.
import { verifySupabaseToken, getUserProfile } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // Public paths - skip auth entirely
  const publicPaths = [
    '/api/auth/',
    '/api/cars',
    '/api/health',
    '/api/debug',
  ]

  const isPublicPath = publicPaths.some(p => path.startsWith(p))
  if (isPublicPath) return

  // Try to get the Supabase access token from cookie
  const token = getCookie(event, 'sb_access_token')

  if (!token) {
    event.context.auth = null
    event.context.user = null

    const protectedPaths = ['/api/user', '/api/seller', '/api/admin']
    if (protectedPaths.some(p => path.startsWith(p))) {
      throw createError({ statusCode: 401, message: 'Authentication required' })
    }
    return
  }

  try {
    // Verify with Supabase
    const authUser = await verifySupabaseToken(token)

    if (!authUser) {
      event.context.auth = null
      event.context.user = null
      deleteCookie(event, 'sb_access_token')

      const protectedPaths = ['/api/user', '/api/seller', '/api/admin']
      if (protectedPaths.some(p => path.startsWith(p))) {
        throw createError({ statusCode: 401, message: 'Invalid or expired session' })
      }
      return
    }

    // Load profile from our users table
    const profile = await getUserProfile(authUser.id)

    if (!profile) {
      event.context.auth = null
      event.context.user = null
      return
    }

    const userData = {
      id: profile.id,
      auth_uid: authUser.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      funds: parseFloat(profile.funds || 0),
      banned: profile.banned || false,
      verified: profile.verified || false,
    }

    event.context.auth = userData
    event.context.user = userData
  } catch (error: any) {
    // Don't throw on non-protected routes, just clear context
    event.context.auth = null
    event.context.user = null

    const protectedPaths = ['/api/user', '/api/seller', '/api/admin']
    if (protectedPaths.some(p => path.startsWith(p))) {
      throw createError({ statusCode: 401, message: 'Authentication failed' })
    }
  }
})
