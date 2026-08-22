// composables/useAuth.ts
// Uses Supabase for all auth. Stores the access token in a cookie so
// server-side middleware (server/middleware/auth.ts) can verify requests.

export const useAuth = () => {
  const user = useState('user', () => null as any)
  const isAuthenticated = computed(() => !!user.value)
  const isInitialized = useState('auth-initialized', () => false)
  // Guard to prevent registering multiple onAuthStateChange listeners.
  // useState ensures this flag persists across composable calls within the same app instance.
  const listenerRegistered = useState('auth-listener-registered', () => false)

  const getSupabase = () => {
    try {
      const { $supabase } = useNuxtApp()
      return $supabase as any
    } catch {
      return null
    }
  }

  // ─── CRITICAL FIX ────────────────────────────────────────────────────────────
  // useCookie MUST be called synchronously at the top level of the composable,
  // NOT inside an async function after an `await`. After an await, the Nuxt
  // context may be gone, causing the cookie to silently fail to set — which
  // means the server middleware never sees a token and treats every request as
  // unauthenticated.
  //
  // Also changed sameSite from 'strict' to 'lax': 'strict' blocks cookies on
  // redirects and navigations from external URLs, which breaks auth on Render
  // and any reverse-proxy deployment.
  // ─────────────────────────────────────────────────────────────────────────────
  const authCookie = useCookie('sb-access-token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',           // was 'strict' — causes cookie to be blocked on redirects
    secure: !import.meta.dev,
    path: '/',                 // explicit: the cookie must be sent to /api/* too
    // NOT httpOnly — must be readable/writable from client JS
  })

  const setAuthCookie = (token: string | null) => {
    authCookie.value = token   // just update the already-initialised ref
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
    } catch (err) {
      user.value = null
      isInitialized.value = true
      return false
    }
  }

  // Register the auth state listener only once per app instance.
  // Previously this block ran every time useAuth() was called (middleware,
  // layout, page components, etc.), stacking up duplicate listeners that all
  // fired syncAuth() simultaneously and caused race conditions.
  if (process.client && !listenerRegistered.value) {
    listenerRegistered.value = true

    nextTick(() => {
      const supabase = getSupabase()
      if (supabase) {
        supabase.auth.onAuthStateChange((event: string, session: any) => {
          // ─── IMPORTANT ──────────────────────────────────────────────────
          // Supabase runs this callback while it holds its internal storage
          // lock. Calling another supabase.auth.* method from inside it (the
          // previous code awaited syncAuth(), which calls getSession()) can
          // deadlock the auth client — after which every request that needs a
          // token hangs forever. Anything that touches Supabase has to be
          // deferred out of the callback.
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
              setAuthCookie(session.access_token)
            }
            setTimeout(() => { syncAuth() }, 0)
          } else if (event === 'SIGNED_OUT') {
            user.value = null
            setAuthCookie(null)
          }
        })
      }
      // Only sync on initial load, not on every composable call
      if (!isInitialized.value) {
        syncAuth()
      }
    })
  }

  // Convenience flags used all over the UI to gate posting / chatting / bidding.
  const isVerified = computed(() => !!user.value?.verified)
  const isBanned = computed(() => !!user.value?.banned)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /**
   * Returns an access token that is valid right now. supabase-js refreshes a
   * stale token inside getSession(), so this never hands back a dead JWT the
   * way the raw cookie used to.
   */
  const getAccessToken = async (): Promise<string | null> => {
    const supabase = getSupabase()
    if (!supabase) return authCookie.value || null
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token || null
      if (token && authCookie.value !== token) setAuthCookie(token)
      return token
    } catch {
      return authCookie.value || null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isInitialized: readonly(isInitialized),
    isVerified,
    isBanned,
    isAdmin,
    getAccessToken,
    /** Re-reads the profile row, e.g. after an admin verifies the account. */
    refreshUser: syncAuth,

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
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', data.user.id)
            .single()

          // FIX: was silently returning false — now throws so the login page
          // can show the user a meaningful error instead of just doing nothing.
          if (profileError || !profileData) {
            throw new Error('Account profile not found. Please contact support.')
          }

          if (profileData.banned) {
            await supabase.auth.signOut()
            setAuthCookie(null)
            throw new Error('This account has been suspended. Please contact support.')
          }

          user.value = { ...profileData, auth_uid: data.user.id }

          // Update last login (fire-and-forget, don't block the login flow)
          supabase
            .from('users')
            .update({
              last_login: new Date().toISOString(),
              login_count: (profileData.login_count || 0) + 1,
            })
            .eq('id', profileData.id)
            .then(() => {}) // intentionally not awaited

          return true
        }

        return false
      } catch (error: any) {
        user.value = null
        throw error
      }
    },

    async register(userData: any) {
      // Registration goes through the server endpoint only. It is the single
      // place that enforces the ID-document requirement, creates the auth user
      // with the service-role key and rolls back cleanly on failure.
      const result: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData,
      })
      return result
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