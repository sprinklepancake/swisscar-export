// composables/useChatAuth.ts
export const useChatAuth = () => {
  const getToken = () => {
    return useCookie('access_token').value
  }

  const getAuthHeaders = () => {
    const token = getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const ensureAuth = async () => {
    const token = getToken()
    if (!token) {
      // Redirect to login
      const router = useRouter()
      await router.push('/login')
      throw new Error('Please login to send messages')
    }
    return token
  }

  return {
    getToken,
    getAuthHeaders,
    ensureAuth
  }
}