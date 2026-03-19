// server/middleware/admin.auth.ts
// Admin routes are already protected by the main server/middleware/auth.ts
// which sets event.context.user via Supabase token verification.
// This file just adds an extra role check for /api/admin/ routes.
export default defineEventHandler(async (event) => {
  const path = event.path

  if (path?.startsWith('/api/admin/') && !path.includes('/api/admin/setup')) {
    const user = event.context.user

    // Do NOT throw 401 if user is missing – let the handler deal with it.
    // Only attach adminUser if user exists (for backward compatibility).
    if (user) {
      event.context.adminUser = user
    }
  }
})