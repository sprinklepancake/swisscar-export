// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // On client side, sync auth state from Supabase session before checking routes
  if (process.client) {
    // If auth hasn't been initialized yet, run syncAuth and wait for it
    if (!auth.isInitialized.value) {
      await auth.syncAuth()
    }
  }

  // Protect routes that require authentication
  const protectedRoutes = ['/dashboard', '/sell', '/profile']
  const isProtected = protectedRoutes.some(route => to.path.includes(route))

  if (isProtected && !auth.user.value) {
    return navigateTo('/login')
  }

  // Redirect away from auth pages if already logged in
  const authPages = ['/login', '/register']
  const isAuthPage = authPages.some(page => to.path.endsWith(page))

  if (isAuthPage && auth.user.value) {
    return navigateTo(auth.user.value.role === 'seller' ? '/dashboard' : '/')
  }
})