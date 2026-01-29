// server/middleware/security.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  // Basic CSP policy if none configured
  const cspPolicy = config.public.cspPolicy || "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"

  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': cspPolicy,
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  })
})