// server/middleware/rateLimit.ts
//
// The old version rate-limited exactly one path: /api/auth/login. That route is
// a stub that always returns 410 — real logins go straight from the browser to
// Supabase — so in practice nothing on this site was rate limited at all.
//
// These are the endpoints worth protecting: account creation (spam signups,
// each of which uploads a file), password reset (email bombing) and password
// change (guessing the current password).
import type { H3Event } from 'h3'
import { RateLimiterMemory } from 'rate-limiter-flexible'

interface Rule {
  match: (path: string) => boolean
  limiter: RateLimiterMemory
  message: string
}

const strip = (path: string) => (path || '').split('?')[0].replace(/\/$/, '')

const RULES: Rule[] = [
  {
    match: p => p === '/api/auth/register',
    limiter: new RateLimiterMemory({
      points: Number(process.env.REGISTER_RATE_LIMIT) || 5,
      duration: 60 * 60, // per hour, per IP
    }),
    message: 'Too many accounts have been created from this connection. Please try again later.',
  },
  {
    match: p => p === '/api/auth/forgot-password',
    limiter: new RateLimiterMemory({ points: 5, duration: 15 * 60 }),
    message: 'Too many password reset requests. Please try again in a few minutes.',
  },
  {
    match: p => p === '/api/user/change-password',
    limiter: new RateLimiterMemory({ points: 10, duration: 15 * 60 }),
    message: 'Too many password change attempts. Please try again in a few minutes.',
  },
  {
    match: p => p === '/api/admin/setup',
    limiter: new RateLimiterMemory({ points: 3, duration: 60 * 60 }),
    message: 'Too many attempts. Please try again later.',
  },
  {
    match: p => p === '/api/upload/image' || p === '/api/user/upload-id',
    limiter: new RateLimiterMemory({ points: 120, duration: 60 * 60 }),
    message: 'Too many uploads from this connection. Please wait a few minutes and try again.',
  },
]

export default defineEventHandler(async (event: H3Event) => {
  const path = strip(event.path)
  const rule = RULES.find(r => r.match(path))
  if (!rule) return

  const ip =
    (getRequestHeader(event, 'x-forwarded-for') || '').split(',')[0].trim() ||
    getRequestIP(event) ||
    'unknown'

  try {
    await rule.limiter.consume(ip)
  } catch {
    throw createError({ statusCode: 429, statusMessage: rule.message })
  }
})
