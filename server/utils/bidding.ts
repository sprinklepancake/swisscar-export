// server/utils/bidding.ts
//
// There were two near-identical bid handlers (/api/bids/create and
// /api/cars/[id]/bid) that had already drifted apart — different minimum-bid
// rules, different error messages, one of them not counting existing bids.
// Both now call this single implementation.
//
// MONEY MODEL
// ───────────
// A bid debits the bidder's wallet immediately, as a commitment deposit. That
// is what makes the "bid and don't complete → ban" rule enforceable. Three
// things therefore have to be true, and none of them were:
//
//   1. Being outbid returns the deposit. It never did — losing an auction cost
//      the loser their entire bid.
//   2. Raising your OWN bid costs only the difference, not the whole new amount.
//   3. A deposit is refunded exactly once. The refund must therefore be driven
//      by an atomic claim (UPDATE … RETURNING) rather than by a separate read,
//      or two overlapping bids both refund the same deposit.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAuctionAccess } from '~/server/utils/auth'
import { adjustFunds, InsufficientFundsError } from '~/server/utils/wallet'
import type { H3Event } from 'h3'

// Exported so /api/bids/canBid advertises exactly the minimum this file
// enforces. They were computed independently and disagreed: the page demanded
// startingPrice + max(100, 5%) while the server accepted startingPrice.
export const MIN_INCREMENT = 50
const LIVE_STATUSES = ['auction', 'active']

const num = (v: any) => {
  const n = parseFloat(String(v ?? 0))
  return Number.isFinite(n) ? n : 0
}

export async function placeBid(event: H3Event, rawCarId: unknown, rawAmount: unknown) {
  // Bidding — and ONLY bidding — requires an admin-checked ID document. That
  // is what makes the "bid and don't complete the purchase → ban" rule
  // enforceable; listing a car or messaging a seller needs no such thing.
  const user = await requireAuctionAccess(event, 'place bids')

  const carId = parseInt(String(rawCarId), 10)
  const bidAmount = parseFloat(String(rawAmount))

  if (!carId || Number.isNaN(carId)) {
    throw createError({ statusCode: 400, statusMessage: 'A car ID is required' })
  }
  if (Number.isNaN(bidAmount) || bidAmount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid bid amount' })
  }

  const supabase = getSupabaseAdmin()

  // ── The car ────────────────────────────────────────────────────────────────
  const { data: car } = await supabase
    .from('cars')
    .select('id, make, model, listing_type, status, auction_end, current_bid, starting_price, seller_id, highest_bidder_id, bid_count')
    .eq('id', carId)
    .single()

  if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
  if (car.listing_type !== 'auction') {
    throw createError({ statusCode: 400, statusMessage: 'This car is not listed as an auction' })
  }
  // An auction row is stored with status 'auction'. Requiring 'active' — as
  // both handlers used to — made every single bid fail.
  if (!LIVE_STATUSES.includes(car.status)) {
    throw createError({ statusCode: 400, statusMessage: 'This auction is no longer open for bids.' })
  }
  if (car.auction_end && new Date() > new Date(car.auction_end)) {
    throw createError({ statusCode: 400, statusMessage: 'This auction has ended.' })
  }
  if (car.seller_id === user.id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot bid on your own car' })
  }

  // ── Minimum bid ────────────────────────────────────────────────────────────
  const { data: highestBid } = await supabase
    .from('bids')
    .select('amount')
    .eq('car_id', carId)
    .eq('status', 'pending')
    .order('amount', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startingPrice = num(car.starting_price)
  const highest = highestBid ? num(highestBid.amount) : null
  // Guard against an auction that was created without a starting price, which
  // would otherwise make any bid of 1 rappen acceptable.
  const floor = Math.max(startingPrice, MIN_INCREMENT)
  const minBid = highest === null ? floor : highest + MIN_INCREMENT

  if (bidAmount < minBid) {
    throw createError({ statusCode: 400, statusMessage: `Your bid must be at least CHF ${minBid.toFixed(2)}` })
  }

  // ── Claim every standing deposit on this car ───────────────────────────────
  // UPDATE … RETURNING is the atomic part: only the rows this call actually
  // flipped come back, so two bids landing at the same moment cannot both
  // refund the same deposit, and a failed write cannot leave a deposit that
  // gets refunded again on the next bid.
  const { data: claimed, error: claimError } = await supabase
    .from('bids')
    .update({ status: 'outbid' })
    .eq('car_id', carId)
    .eq('status', 'pending')
    .select('id, user_id, amount')

  if (claimError) {
    console.error('[bidding] could not retire standing bids:', claimError.message)
    throw createError({ statusCode: 500, statusMessage: 'We could not place your bid. Please try again.' })
  }

  const claimedBids = claimed || []
  const ownHeld = claimedBids
    .filter((b: any) => b.user_id === user.id)
    .reduce((sum: number, b: any) => sum + num(b.amount), 0)

  // Refund everyone we just displaced. The bidder's own held amount is not
  // refunded separately — it is netted off the new charge below, which keeps
  // the ledger to one row instead of a refund/charge pair for the same person.
  const restoreClaimed = async () => {
    for (const b of claimedBids) {
      await supabase.from('bids').update({ status: 'pending' }).eq('id', b.id)
    }
  }

  for (const prev of claimedBids) {
    if (!prev.user_id || prev.user_id === user.id) continue
    const refund = num(prev.amount)
    if (refund <= 0) continue
    try {
      await adjustFunds(prev.user_id, refund, {
        type: 'refund',
        description: `Outbid on ${car.make} ${car.model} — your bid was returned`,
        referenceId: prev.id,
        carId,
      })
    } catch (err: any) {
      console.error('[bidding] refund failed for bid', prev.id, err?.message || err)
    }
  }

  // ── Charge the new bidder (net of their own released deposit) ──────────────
  const netCharge = bidAmount - ownHeld
  let balance
  try {
    balance = await adjustFunds(user.id, -netCharge, {
      type: 'bid_payment',
      description: ownHeld > 0
        ? `Raised your bid on ${car.make} ${car.model}`
        : `Bid on ${car.make} ${car.model}`,
      carId,
    })
  } catch (err: any) {
    // Put the bids back so nothing is lost, then report honestly.
    await restoreClaimed().catch(() => {})
    if (err instanceof InsufficientFundsError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Not enough funds. You need CHF ${netCharge.toFixed(2)} available to place this bid.`,
      })
    }
    throw err
  }

  // ── Record the bid ─────────────────────────────────────────────────────────
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .insert({ car_id: carId, user_id: user.id, amount: bidAmount, status: 'pending' })
    .select('id, amount, status')
    .single()

  if (bidError || !bid) {
    console.error('[bidding] could not record bid:', bidError)
    // Give the money straight back — nothing was actually bid.
    await adjustFunds(user.id, netCharge, {
      type: 'refund',
      description: `Bid on ${car.make} ${car.model} could not be saved — amount returned`,
      carId,
    }).catch(() => {})
    throw createError({ statusCode: 500, statusMessage: 'We could not record your bid. Please try again.' })
  }

  const newBidCount = (car.bid_count || 0) + 1
  await supabase
    .from('cars')
    .update({ current_bid: bidAmount, highest_bidder_id: user.id, bid_count: newBidCount })
    .eq('id', carId)

  return {
    success: true,
    bid: { id: bid.id, amount: bid.amount, status: bid.status },
    car: { currentBid: bidAmount, bidCount: newBidCount },
    currentBid: bidAmount,
    bidCount: newBidCount,
    user: { newBalance: balance.newBalance },
  }
}
