// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth()
  
  // Only run on client side for now
  if (process.client) {
    try {
      const { data } = await useFetch('/api/auth/me')
      
      if (data.value?.user) {
        auth.user.value = data.value.user
      } else {
        auth.user.value = null
      }
    } catch (error) {
      auth.user.value = null
    }
  }
  
  // Protect routes that require authentication
  const protectedRoutes = ['/dashboard', '/sell', '/profile']
  const isProtected = protectedRoutes.some(route => to.path.startsWith(route))
  
  if (isProtected && !auth.user.value) {
    return navigateTo('/login')
  }
  
  // Redirect away from auth pages if already logged in
  const authPages = ['/login', '/register']
  if (authPages.includes(to.path) && auth.user.value) {
    return navigateTo(auth.user.value.role === 'seller' ? '/dashboard' : '/')
  }
})