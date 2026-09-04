// server/api/cars/[id]/bids.get.ts
//
// PUBLIC endpoint — the bid history is shown on every auction listing, to
// logged-out visitors included. It used to select `users!user_id (name, email)`
// and return `userEmail` for every bidder, so a single unauthenticated GET
// harvested the email address of everyone who had ever bid. Nothing in the UI
// ever rendered that field.
//
// Bidder identity is now pseudonymised: you see your own bids as yours, the
// seller and administrators see real names because they have to settle the
// sale, and everyone else sees an abbreviated name. Emails are never returned.
import { getSupabaseAdmin } from '~/server/utils/supabase'

/** "Marko Kovacevic" -> "Marko K." Keeps the avatar initial meaningful. */
const abbreviate = (name: string | null | undefined, fallbackId: number) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return `Bidder ${fallbackId}`
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
}

export default defineEventHandler(async (event) => {
  const carId = getRouterParam(event, 'id')
  // May be null: the endpoint stays public.
  const viewer = event.context.user || null

  if (!carId) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Get the car
    const { data: car } = await supabase
      .from('cars')
      .select('id, listing_type, current_bid, starting_price, reserve_price, highest_bidder_id, seller_id')
      .eq('id', carId)
      .single()

    if (!car) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    }

    if (car.listing_type !== 'auction') {
      return { success: true, message: 'This is not an auction listing', bids: [] }
    }

    // Names only. Selecting email here is what leaked it.
    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        id, amount, status, created_at, user_id,
        user:users!user_id (name)
      `)
      .eq('car_id', carId)
      .order('amount', { ascending: false })

    if (error) throw error

    // The seller has to contact the winner, and an admin settles disputes, so
    // both see real names. Nobody else does.
    const seesRealNames = !!viewer && (viewer.role === 'admin' || viewer.id === car.seller_id)

    const formattedBids = (bids || []).map((bid: any) => {
      const isYou = !!viewer && bid.user_id === viewer.id
      return {
        id: bid.id,
        amount: parseFloat(bid.amount),
        status: bid.status,
        createdAt: bid.created_at,
        // Kept: the page uses it only to mark your own row, and it is already
        // public via highestBidderId below.
        userId: bid.user_id,
        isYou,
        userName: (isYou || seesRealNames)
          ? (bid.user?.name || `Bidder ${bid.user_id}`)
          : abbreviate(bid.user?.name, bid.user_id),
        isWinning: bid.status === 'pending' && bid.user_id === car.highest_bidder_id,
      }
    })

    return {
      success: true,
      carId: parseInt(carId),
      totalBids: formattedBids.length,
      currentBid: car.current_bid,
      startingPrice: car.starting_price,
      reservePrice: car.reserve_price,
      highestBidderId: car.highest_bidder_id,
      bids: formattedBids,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch bid history' })
  }
})
