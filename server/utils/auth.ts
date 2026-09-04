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
  /** users.verified_buyer — an admin has checked this account's ID for auctions. */
  verifiedBuyer: boolean
  /** users.buyer_type — 'auction' means the account has asked for auction access. */
  buyerType: 'direct' | 'auction'
  /** Whether an identity document is on file at all. */
  hasIdDocument: boolean
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
 * A signed-in account in good standing.
 *
 * Every account is `verified` from the moment it is created — signing up is no
 * longer gated behind an administrator reviewing an ID document. The flag now
 * works the other way round: an admin can REVOKE it to restrict an account that
 * is causing problems without banning it outright. So this still guards posting
 * and messaging, it just is not something a normal new user ever trips over.
 *
 * Bidding is NOT covered by this — see requireAuctionAccess().
 */
export async function requireVerified(event: H3Event, action = 'do this'): Promise<AuthedUser> {
  const user = await requireAuth(event)
  if (!user.verified) {
    throw createError({
      statusCode: 403,
      statusMessage: `An administrator has restricted this account. You can browse the site, but you cannot ${action}. Please contact support.`,
      data: { reason: 'unverified' },
    })
  }
  return user
}

/**
 * An account cleared to take part in auctions.
 *
 * This is the ONE place identity documents still matter. Bidding commits real
 * money and carries the "bid and don't complete → permanent ban" rule, which is
 * only enforceable against someone whose identity is known. Browsing, listing a
 * car and messaging a seller need none of it.
 */
export async function requireAuctionAccess(event: H3Event, action = 'place bids'): Promise<AuthedUser> {
  const user = await requireVerified(event, action)
  if (user.role === 'admin') return user

  if (!user.verifiedBuyer) {
    // Same rule as /api/bids/canBid and pages/profile.vue: a document on its own
    // does not mean anyone is reviewing it. Legacy accounts all have one and a
    // revoked account keeps its file, so keying off the document alone promised
    // both groups a review that was not happening.
    const awaitingReview = user.hasIdDocument && user.buyerType === 'auction'
    throw createError({
      statusCode: 403,
      statusMessage: awaitingReview
        ? `Your auction access is still being reviewed. An administrator is checking your ID document — you will be able to ${action} as soon as it is approved.`
        : `To ${action} you need auction access. Upload an identity document on your profile page and an administrator will approve it, usually within 24 hours.`,
      data: {
        reason: 'auction_access_required',
        hasIdDocument: user.hasIdDocument,
        pending: awaitingReview,
      },
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
