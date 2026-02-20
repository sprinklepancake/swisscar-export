// server/api/bids/create.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { carId, amount } = await readBody(event)

  if (!carId || !amount || isNaN(parseFloat(amount))) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID and valid amount are required' })
  }

  const bidAmount = parseFloat(amount)

  try {
    const supabase = getSupabaseAdmin()

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, verified, banned, funds')
      .eq('id', user.id)
      .single()

    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    if (profile.banned) throw createError({ statusCode: 403, statusMessage: 'Your account has been banned from placing bids' })
    if (!profile.verified) throw createError({ statusCode: 403, statusMessage: 'Only verified users can place bids. Please contact admin to get verified.' })

    const previousBalance = parseFloat(profile.funds || 0)
    if (previousBalance < bidAmount) throw createError({ statusCode: 400, statusMessage: 'Insufficient funds' })

    // Get the car
    const { data: car } = await supabase
      .from('cars')
      .select('id, make, model, listing_type, status, auction_end, current_bid, starting_price, reserve_price, seller_id, highest_bidder_id')
      .eq('id', carId)
      .single()

    if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    if (car.listing_type !== 'auction') throw createError({ statusCode: 400, statusMessage: 'This car is not listed as an auction' })
    if (car.status !== 'active') throw createError({ statusCode: 400, statusMessage: 'Auction is not active' })
    if (car.auction_end && new Date() > new Date(car.auction_end)) throw createError({ statusCode: 400, statusMessage: 'Auction has ended' })
    if (car.seller_id === user.id) throw createError({ statusCode: 400, statusMessage: 'You cannot bid on your own car' })

    // Get current highest bid
    const { data: highestBid } = await supabase
      .from('bids')
      .select('amount')
      .eq('car_id', carId)
      .eq('status', 'pending')
      .order('amount', { ascending: false })
      .limit(1)
      .single()

    const minBid = highestBid
      ? parseFloat(highestBid.amount) + 50
      : parseFloat(car.starting_price || 0)

    if (bidAmount < minBid) {
      throw createError({ statusCode: 400, statusMessage: `Bid must be at least CHF ${minBid}` })
    }

    // Mark previous winning bid as outbid
    if (car.highest_bidder_id) {
      await supabase
        .from('bids')
        .update({ status: 'outbid' })
        .eq('car_id', carId)
        .eq('status', 'pending')
    }

    // Create the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        car_id: carId,
        user_id: user.id,
        amount: bidAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (bidError) throw bidError

    // Update car with new bid info
    const newBidCount = (car.bid_count || 0) + 1
    await supabase
      .from('cars')
      .update({
        current_bid: bidAmount,
        highest_bidder_id: user.id,
        bid_count: newBidCount,
      })
      .eq('id', carId)

    // Deduct funds from user
    const newBalance = previousBalance - bidAmount
    await supabase.from('users').update({ funds: newBalance }).eq('id', user.id)

    // Log transaction
    await supabase.from('transaction_logs').insert({
      user_id: user.id,
      type: 'bid_payment',
      amount: -bidAmount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      description: `Bid on ${car.make} ${car.model}`,
      car_id: carId,
    })

    return {
      success: true,
      bid: { id: bid.id, amount: bid.amount, status: bid.status },
      car: { currentBid: bidAmount, bidCount: newBidCount },
      user: { newBalance },
    }
  } catch (error: any) {
    console.error('Error placing bid:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to place bid' })
  }
})
