// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isInitialized = useState('auth-initialized', () => false)
  
  const syncAuth = async () => {
    try {
      const { data, error } = await useFetch('/api/auth/me')
      
      if (error.value) {
        user.value = null
        isInitialized.value = true
        return false
      }
      
      user.value = data.value?.user || null
      isInitialized.value = true
      console.log('Auth sync completed - User:', user.value ? user.value.email : 'null')
      return true
    } catch (error) {
      console.error('Auth sync error:', error)
      user.value = null
      isInitialized.value = true
      return false
    }
  }

  // Sync auth state on client-side - only once
  if (process.client && !isInitialized.value) {
    syncAuth()
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isInitialized: readonly(isInitialized),
    async login(email: string, password: string) {
      try {
        const { data, error } = await useFetch('/api/auth/login', {
          method: 'POST',
          body: { email, password },
          credentials: 'include'
        })
        
        if (error.value) {
          throw new Error(error.value.data?.message || 'Login failed')
        }
        
        if (data.value?.user) {
          user.value = data.value.user
          await syncAuth() // Re-sync to ensure consistency
          return true
        }
        return false
      } catch (error) {
        user.value = null
        throw error
      }
    },
    async logout() {
      try {
        await $fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      } finally {
        // Always clear local state
        user.value = null
        isInitialized.value = true
      }
    },
    syncAuth
  }
}