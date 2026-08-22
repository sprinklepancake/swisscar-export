// server/utils/auth.ts
import type { H3Event } from 'h3'

export interface AuthedUser {
  id: number
  authUid: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'admin'
  funds: number
  verified: boolean
  banned: boolean
  phone: string
  companyName: string
  profileImage: string
  createdAt: string
}

/** Any signed-in account. */
export async function requireAuth(event: H3Event): Promise<AuthedUser> {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Please log in to continue.' })
  }
  if (user.banned) {
    throw createError({ statusCode: 403, statusMessage: 'This account has been suspended.' })
  }
  return user
}

/**
 * A signed-in account that an admin has approved.
 *
 * This is the platform's core trust rule: an unverified account may BROWSE the
 * site, and nothing else. It may not post a listing, send a message or place a
 * bid. Every write endpoint that touches another user goes through here, so the
 * rule cannot be bypassed by calling the API directly.
 */
export async function requireVerified(event: H3Event, action = 'do this'): Promise<AuthedUser> {
  const user = await requireAuth(event)
  if (!user.verified) {
    throw createError({
      statusCode: 403,
      statusMessage: `Your account is waiting for admin approval. You can browse the site, but you cannot ${action} until an administrator has checked your ID document.`,
      data: { reason: 'unverified' },
    })
  }
  return user
}

export async function requireAdmin(event: H3Event): Promise<AuthedUser> {
  // requireAuth also rejects suspended accounts — an admin who has been banned
  // must not keep admin powers.
  const user = await requireAuth(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  return user
}
