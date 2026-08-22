// server/middleware/04.localeRedirect.ts
//
// Numeric prefix = explicit ordering. Nitro runs server middleware in filename
// order, so this file MUST sort after 01.security.ts — otherwise the redirect
// response below goes out with no CSP, HSTS or X-Frame-Options headers.
//
// The i18n strategy is 'prefix', so /login, /cars, /register … do not exist as
// routes — only /en/login, /de/login and so on. Anyone with an old bookmark, a
// link from a message, or who simply types "swissexportcar.ch/login" got Nuxt's
// bare "404 Page not found: /login" screen.
//
// Rather than leave those as dead ends, send them to the same page in the
// visitor's language.
import { LOCALE_CODES, DEFAULT_LOCALE } from '~/constants/locales'

const CODES = new Set<string>(LOCALE_CODES as readonly string[])

// Everything that must never be rewritten. /.well-known matters in
// particular: it is how Let's Encrypt, Apple and Google verify the domain, and
// redirecting it breaks certificate renewal.
const PASSTHROUGH = [
  '/api/', '/_nuxt/', '/_ipx/', '/__nuxt', '/_payload', '/assets/',
  '/.well-known/', '/_vercel/', '/_ipx',
]
const PASSTHROUGH_EXACT = new Set([
  '/favicon.ico', '/robots.txt', '/sitemap.xml', '/manifest.json', '/sw.js',
])

const pickLocale = (event: any): string => {
  const cookie = getCookie(event, 'i18n_redirected')
  if (cookie && CODES.has(cookie)) return cookie

  const header = getHeader(event, 'accept-language') || ''
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase()
    if (!tag) continue
    if (CODES.has(tag)) return tag
    const base = tag.split('-')[0]
    if (CODES.has(base)) return base
  }
  return DEFAULT_LOCALE
}

export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return

  const url = event.path || '/'
  // split('?') drops everything after a SECOND '?', which mangles query values
  // that contain one (a redirect= parameter, for instance).
  const q = url.indexOf('?')
  const path = q === -1 ? url : url.slice(0, q)
  const query = q === -1 ? '' : url.slice(q + 1)

  // The site root is handled by the i18n module's own redirect.
  if (path === '/' || path === '') return
  if (path.startsWith('/.well-known')) return
  if (PASSTHROUGH_EXACT.has(path)) return
  if (PASSTHROUGH.some(prefix => path.startsWith(prefix))) return

  // Anything that looks like a file (has an extension) is an asset.
  const last = path.split('/').pop() || ''
  if (last.includes('.')) return

  const first = path.split('/')[1]
  if (CODES.has(first)) return // already localised

  const target = `/${pickLocale(event)}${path}${query ? `?${query}` : ''}`
  return sendRedirect(event, target, 302)
})
