// composables/useAuth.ts
// Uses Supabase for all auth. Stores the access token in a cookie so
// server-side middleware (server/middleware/auth.ts) can verify requests.

export const useAuth = () => {
  const user = useState('user', () => null as any)
  const isAuthenticated = computed(() => !!user.value)
  const isInitialized = useState('auth-initialized', () => false)

  const getSupabase = () => {
    try {
      const { $supabase } = useNuxtApp()
      return $supabase as any
    } catch {
      return null
    }
  }

  // FIX: cookie name must use hyphens to match server/middleware/auth.ts
  // which reads 'sb-access-token' (hyphen), not 'sb_access_token' (underscore)
  const setAuthCookie = (token: string | null) => {
    const cookie = useCookie('sb-access-token', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      // NOT httpOnly - needs to be set from client JS
    })
    cookie.value = token
  }

  const syncAuth = async () => {
    try {
      const supabase = getSupabase()
      if (!supabase) {
        user.value = null
        isInitialized.value = true
        return false
      }

      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        user.value = null
        setAuthCookie(null)
        isInitialized.value = true
        return false
      }

      // Keep cookie in sync with current session token
      setAuthCookie(sessionData.session.access_token)

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', sessionData.session.user.id)
        .single()

      if (error || !userData) {
        user.value = null
        isInitialized.value = true
        return false
      }

      user.value = { ...userData, auth_uid: sessionData.session.user.id }
      isInitialized.value = true
      return true
    } catch (error) {
      user.value = null
      isInitialized.value = true
      return false
    }
  }

  if (process.client) {
    nextTick(() => {
      const supabase = getSupabase()
      if (supabase) {
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
              setAuthCookie(session.access_token)
            }
            await syncAuth()
          } else if (event === 'SIGNED_OUT') {
            user.value = null
            setAuthCookie(null)
          }
        })
      }
      syncAuth()
    })
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isInitialized: readonly(isInitialized),

    async login(email: string, password: string) {
      try {
        const supabase = getSupabase()
        if (!supabase) throw new Error('Supabase client not available')

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw new Error(error.message || 'Login failed')

        if (data.session?.access_token) {
          setAuthCookie(data.session.access_token)
        }

        if (data.user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', data.user.id)
            .single()

          if (profileData) {
            user.value = { ...profileData, auth_uid: data.user.id }

            // Update last login
            await supabase
              .from('users')
              .update({
                last_login: new Date().toISOString(),
                login_count: (profileData.login_count || 0) + 1,
              })
              .eq('id', profileData.id)
          }

          return true
        }

        return false
      } catch (error: any) {
        user.value = null
        throw error
      }
    },

    async register(userData: any) {
      try {
        const supabase = getSupabase()
        if (!supabase) throw new Error('Supabase client not available')

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              role: userData.role,
            },
          },
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('User creation failed')

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            email: userData.email,
            name: userData.name,
            phone: userData.phone?.replace(/\D/g, ''),
            role: userData.role,
            company_name: userData.companyName,
            business_type: userData.businessType,
            tax_id: userData.taxId,
            street_address: userData.streetAddress,
            address: userData.streetAddress,
            canton: userData.canton,
            city: userData.city,
            zip_code: userData.zipCode,
            country: userData.country || 'Switzerland',
            auth_uid: authData.user.id,
            free_feature_credits: userData.role === 'seller' ? 1 : 0,
            verified: false,
            banned: false,
            funds: 0,
          })
          .select()
          .single()

        if (profileError) throw profileError

        user.value = { ...profileData, auth_uid: authData.user.id }
        return { user: user.value }
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed')
      }
    },

    async logout() {
      try {
        const supabase = getSupabase()
        if (!supabase) throw new Error('Supabase client not available')

        await supabase.auth.signOut()
        user.value = null
        setAuthCookie(null)
      } catch (error: any) {
        throw new Error(error.message || 'Logout failed')
      }
    },

    syncAuth,
  }
}