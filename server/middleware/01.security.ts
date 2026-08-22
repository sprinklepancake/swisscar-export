// server/middleware/security.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl || ''
  let supabaseHost = '*.supabase.co'
  try {
    if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname
  } catch {}

  // NOTE: the previous policy allowed only 'self' for styles and fonts, while
  // both nuxt.config.ts and assets/css/main.css pull Inter from Google Fonts.
  // The browser silently blocked it, so the whole site fell back to a system
  // font and every page shifted layout after first paint.
  const cspPolicy = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://*.supabase.co wss://*.supabase.co`,
    `frame-src 'none'`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ')

  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': cspPolicy,
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  })
})
