// server/api/bids/canBid.get.ts
//
// Mirrors requireAuctionAccess() in server/utils/auth.ts so the detail page can
// show the right message BEFORE the user types a bid. Identity verification is
// only ever required here — not for listing a car or contacting a seller.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { MIN_INCREMENT } from '~/server/utils/bidding'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return { canBid: false, reason: 'not_authenticated', message: 'Please log in to place bids' }
    }

    const supabase = getSupabaseAdmin()

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, role, verified, verified_buyer, buyer_type, id_document_url, banned, funds')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { canBid: false, reason: 'user_not_found', message: 'User not found' }
    }

    if (profile.banned) {
      return { canBid: false, reason: 'banned', userBanned: true, message: 'Your account has been banned from placing bids' }
    }

    if (!profile.verified && profile.role !== 'admin') {
      return {
        canBid: false,
        reason: 'restricted',
        message: 'An administrator has restricted this account. Please contact support.',
      }
    }

    const hasIdDocument = !!profile.id_document_url
    // "Pending" means the account ASKED and gave us something to look at. A
    // document on its own is not enough: under the old rules every account
    // uploaded one, and a revoked account keeps its file while buyer_type goes
    // back to 'direct'. Keying off the document alone told both groups they
    // were "being reviewed" when nobody was reviewing anything — and
    // pages/profile.vue, which checks both, disagreed with it.
    const awaitingReview = hasIdDocument && profile.buyer_type === 'auction'

    if (!profile.verified_buyer && profile.role !== 'admin') {
      return {
        canBid: false,
        reason: awaitingReview ? 'auction_access_pending' : 'auction_access_required',
        // The detail page uses this to decide whether to offer the
        // "request auction access" button.
        needsVerification: !awaitingReview,
        auctionAccessPending: awaitingReview,
        hasIdDocument,
        message: awaitingReview
          ? 'Your auction access is being reviewed. An administrator is checking your ID document — bidding unlocks as soon as it is approved.'
          : 'Bidding is the only part of the site that needs ID verification. Upload an identity document on your profile to request auction access.',
      }
    }

    const funds = parseFloat(profile.funds || 0)

    // ── Per-car figures ───────────────────────────────────────────────────────
    // Optional (?carId=). Without them the browser has to guess the minimum bid
    // and the spendable balance, and both guesses were wrong:
    //
    //   * the page computed startingPrice + max(100, 5%) while placeBid()
    //     accepts startingPrice, so it refused bids the server would have taken;
    //   * a bid debits the wallet immediately, so the CURRENT leading bidder's
    //     balance is always below their own next legal bid. The page disabled
    //     the button against the raw balance, which made it impossible for the
    //     leading bidder to ever raise their own bid. placeBid() only charges
    //     the difference, so the money was never the real constraint.
    let carFigures: Record<string, number> | null = null
    const rawCarId = getQuery(event).carId
    const carId = rawCarId ? parseInt(String(rawCarId), 10) : NaN

    if (Number.isFinite(carId)) {
      const [{ data: car }, { data: standing }] = await Promise.all([
        supabase.from('cars').select('starting_price').eq('id', carId).maybeSingle(),
        supabase.from('bids').select('user_id, amount').eq('car_id', carId).eq('status', 'pending'),
      ])

      if (car) {
        const amounts = (standing || []).map((b: any) => parseFloat(b.amount) || 0)
        const highest = amounts.length ? Math.max(...amounts) : null
        const startingPrice = parseFloat(car.starting_price as any) || 0
        // Identical to server/utils/bidding.ts — deliberately, so the number the
        // page shows is the number placeBid() will accept.
        const minBid = highest === null
          ? Math.max(startingPrice, MIN_INCREMENT)
          : highest + MIN_INCREMENT

        // What this user already has committed on THIS car is netted off a new
        // bid rather than charged again.
        const ownHeld = (standing || [])
          .filter((b: any) => b.user_id === profile.id)
          .reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0)

        carFigures = { minBid, ownHeld, availableToBid: funds + ownHeld, increment: MIN_INCREMENT }
      }
    }

    return {
      canBid: true,
      user: {
        id: profile.id,
        name: profile.name,
        funds,
        verified: profile.verified,
        verifiedBuyer: profile.verified_buyer,
        banned: profile.banned,
        role: profile.role,
      },
      car: carFigures,
      requirements: {
        verified: true,
        auctionAccess: true,
        notBanned: true,
        hasFunds: funds > 0,
        message: funds > 0 ? 'You can place bids' : 'Add funds to your wallet to place bids',
      },
    }
  } catch (error) {
    console.error('Error checking bid eligibility:', error)
    return { canBid: false, reason: 'error', message: 'Error checking bid eligibility' }
  }
})
