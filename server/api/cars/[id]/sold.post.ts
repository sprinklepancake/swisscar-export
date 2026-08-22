// server/api/cars/[id]/sold.post.ts
//
// The seller's "Mark as sold" button in /dashboard/my-cars called this route,
// which did not exist — the click 404'd and the listing stayed active forever.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAuth } from '~/server/utils/auth'
import { releaseHeldBids } from '~/server/utils/wallet'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const supabase = getSupabaseAdmin()

  const { data: car } = await supabase
    .from('cars')
    .select('id, seller_id, status, listing_type')
    .eq('id', carId)
    .single()

  if (!car) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })
  if (car.seller_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'This is not your listing.' })
  }
  if (car.status === 'sold') return { success: true, message: 'This listing is already marked as sold.' }

  // ── Settle the auction ─────────────────────────────────────────────────────
  // Bids hold real money. Nothing in the app ever released it, so a winning
  // bidder's deposit sat in limbo for good and losing bids that had somehow
  // stayed 'pending' were never returned.
  let winningBidId: number | null = null
  if (car.listing_type === 'auction') {
    const { data: winner } = await supabase
      .from('bids')
      .select('id')
      .eq('car_id', carId)
      .eq('status', 'pending')
      .order('amount', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (winner) {
      winningBidId = winner.id
      // The winner's deposit IS the payment, so it is consumed, not returned.
      await supabase.from('bids').update({ status: 'won' }).eq('id', winner.id)
    }

    // Anything else still standing goes back to its bidder.
    await releaseHeldBids(parseInt(String(carId)), {
      exceptBidId: winningBidId || undefined,
      reason: 'Auction closed — your bid was returned',
      newStatus: 'lost',
    })
  }

  const { error } = await supabase
    .from('cars')
    .update({ status: 'sold', is_featured: false })
    .eq('id', carId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not update the listing' })

  return { success: true, message: 'Listing marked as sold', winningBidId }
})
