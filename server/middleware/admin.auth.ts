// server/middleware/admin.auth.ts
// Admin routes are already protected by the main server/middleware/auth.ts
// which sets event.context.user via Supabase token verification.
// This file just adds an extra role check for /api/admin/ routes.
export default defineEventHandler(async (event) => {
  const path = event.path

  if (path?.startsWith('/api/admin/') && !path.includes('/api/admin/setup')) {
    const user = event.context.user

    if (!user) {
      throw createError({ statusCode: 401, message: 'Authentication required' })
    }

    if (user.role !== 'admin') {
      throw createError({ statusCode: 403, message: 'Admin access required' })
    }

    // Make admin user available via both contexts for backward compat
    event.context.adminUser = user
  }
})
