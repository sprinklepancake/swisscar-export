// composables/useApiFetch.ts
//
// WHY THIS EXISTS
// ───────────────
// Every authenticated request used to rely on the `sb-access-token` cookie
// being current. It often wasn't: a Supabase access token lives ~1 hour but the
// cookie was written with a 7-day maxAge, so as soon as the token expired every
// server call started returning 401 while the user still looked logged in.
//
// That is what produced the reports we got from real users:
//   • every car photo showing "Failed" (POST /api/upload/image → 401)
//   • "Unauthorized. Please log in." after filling in the whole listing form
//     (POST /api/cars/create → 401)
//   • the profile page showing "please login" for a logged-in user
//
// apiFetch() asks the Supabase client for the session right before the request.
// supabase-js refreshes the token transparently when it is expired or close to
// expiring, so the request always carries a token the server will accept. The
// cookie is kept in sync as a side effect for SSR requests.

export const useApiFetch = () => {
  // useCookie MUST be created synchronously in the composable body — after an
  // `await` the Nuxt context is gone and the write silently no-ops.
  const authCookie = useCookie('sb-access-token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
  })

  // On the server we have no Supabase session; forward the incoming cookies so
  // internal $fetch calls are authenticated the same way the page request was.
  const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}

  const getSupabase = () => {
    try {
      const { $supabase } = useNuxtApp()
      return ($supabase as any) || null
    } catch {
      return null
    }
  }

  /**
   * Returns a token that is valid *right now*, refreshing it if needed.
   * Returns null when there is no session at all (genuinely logged out).
   */
  const getFreshToken = async (): Promise<string | null> => {
    if (!import.meta.client) return authCookie.value || null

    const supabase = getSupabase()
    if (!supabase) return authCookie.value || null

    try {
      // getSession() refreshes an expired/expiring token before returning it.
      const { data, error } = await supabase.auth.getSession()
      const token = data?.session?.access_token || null

      if (token) {
        if (authCookie.value !== token) authCookie.value = token
        return token
      }

      // Only treat "no session" as a real sign-out when Supabase answered
      // cleanly. A failed refresh (offline, Supabase hiccup) also returns no
      // session, and throwing the cookie away there would log the user out for
      // a dropped packet.
      if (!error) {
        if (authCookie.value) authCookie.value = null
        return null
      }
      return authCookie.value || null
    } catch {
      // Network blip while refreshing: fall back to whatever we have.
      return authCookie.value || null
    }
  }

  /**
   * $fetch with a guaranteed-fresh Authorization header.
   * Use this for EVERY endpoint that reads event.context.user.
   */
  const apiFetch = async <T = any>(url: string, options: Record<string, any> = {}): Promise<T> => {
    const token = await getFreshToken()

    const headers: Record<string, string> = {
      ...(ssrHeaders as Record<string, string>),
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) headers.Authorization = `Bearer ${token}`

    return await $fetch<T>(url, { ...options, headers })
  }

  /** True when a usable session exists (does not hit our API). */
  const hasSession = async () => !!(await getFreshToken())

  return { apiFetch, getFreshToken, hasSession }
}
