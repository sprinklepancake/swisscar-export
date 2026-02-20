// server/api/cars/[id]/bids.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const carId = getRouterParam(event, 'id')

  if (!carId) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Get the car
    const { data: car } = await supabase
      .from('cars')
      .select('id, listing_type, current_bid, starting_price, reserve_price, highest_bidder_id')
      .eq('id', carId)
      .single()

    if (!car) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    }

    if (car.listing_type !== 'auction') {
      return { success: true, message: 'This is not an auction listing', bids: [] }
    }

    // Get bids with user names
    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        id, amount, status, created_at, user_id,
        user:users!user_id (name, email)
      `)
      .eq('car_id', carId)
      .order('amount', { ascending: false })

    if (error) throw error

    const formattedBids = (bids || []).map((bid: any) => ({
      id: bid.id,
      amount: parseFloat(bid.amount),
      status: bid.status,
      createdAt: bid.created_at,
      userId: bid.user_id,
      userName: bid.user?.name || `User${bid.user_id}`,
      userEmail: bid.user?.email || '',
      isWinning: bid.user_id === car.highest_bidder_id,
    }))

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
