// middleware/auth.global.ts
import { withLocalePrefix } from '~/constants/locales'

// The i18n strategy is 'prefix': every real route lives under /<locale>/…
// Redirecting to a bare '/login' therefore lands on Nuxt's 404 page — which is
// exactly the "404 Page not found: /login" screenshot users sent in. Every
// redirect below goes through withLocalePrefix() so the user stays in the
// language they were already browsing in.

const PROTECTED = ['/dashboard', '/sell', '/profile', '/messages', '/admin', '/cars/edit']
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']

const stripLocale = (path: string) => path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // On the client, make sure the Supabase session has been read before we
  // decide whether somebody is logged in — otherwise a hard refresh on a
  // protected page bounces the user to the login screen for no reason.
  if (import.meta.client && !auth.isInitialized.value) {
    await auth.syncAuth()
  }

  // On the server we have no Supabase session object, so we cannot reliably
  // tell logged-in from logged-out. Let the page render and let the client-side
  // pass do the gating; the API routes are the real security boundary.
  if (import.meta.server) return

  const path = stripLocale(to.path)

  const isProtected = PROTECTED.some(route => path === route || path.startsWith(route + '/'))
  if (isProtected && !auth.user.value) {
    return navigateTo(withLocalePrefix(to.path, `/login?redirect=${encodeURIComponent(to.fullPath)}`))
  }

  // A suspended account should not be able to reach the members' area at all.
  if (isProtected && auth.user.value?.banned && path !== '/profile') {
    return navigateTo(withLocalePrefix(to.path, '/profile'))
  }

  // Already logged in? Auth pages have nothing to offer.
  const isAuthPage = AUTH_PAGES.some(page => path === page)
  if (isAuthPage && auth.user.value) {
    // …except the reset-password page, which is reached from an email link
    // while a temporary recovery session is active.
    if (path === '/reset-password') return
    return navigateTo(withLocalePrefix(to.path, auth.user.value.role === 'seller' ? '/dashboard' : '/'))
  }
})
