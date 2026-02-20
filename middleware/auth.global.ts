// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Only run on client side
  if (process.client) {
    try {
      const { data } = await useFetch('/api/auth/me')

      if ((data.value as any)?.user) {
        auth.user.value = (data.value as any).user
      } else {
        auth.user.value = null
      }
    } catch {
      auth.user.value = null
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
