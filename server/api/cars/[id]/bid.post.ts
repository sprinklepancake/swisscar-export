// server/api/cars/[id]/bid.post.ts
// Delegates to the same logic as /api/bids/create
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Please log in again.' })

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const { amount } = await readBody(event)
  if (!amount || isNaN(parseFloat(amount))) {
    throw createError({ statusCode: 400, statusMessage: 'Valid bid amount is required' })
  }

  const bidAmount = parseFloat(amount)

  try {
    const supabase = getSupabaseAdmin()

    const { data: profile } = await supabase
      .from('users')
      .select('verified, banned, funds')
      .eq('id', user.id)
      .single()

    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    if (profile.banned) throw createError({ statusCode: 403, statusMessage: 'Your account has been banned' })
    if (!profile.verified) throw createError({ statusCode: 403, statusMessage: 'You must verify your ID before placing bids' })

    const previousBalance = parseFloat(profile.funds || 0)
    if (previousBalance < bidAmount) throw createError({ statusCode: 400, statusMessage: 'Insufficient funds' })

    const { data: car } = await supabase
      .from('cars')
      .select('id, make, model, listing_type, status, auction_end, current_bid, starting_price, seller_id, highest_bidder_id, bid_count')
      .eq('id', carId)
      .single()

    if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    if (car.listing_type !== 'auction') throw createError({ statusCode: 400, statusMessage: 'This car is not listed as an auction' })
    if (car.status !== 'active') throw createError({ statusCode: 400, statusMessage: 'Auction is not active' })
    if (car.auction_end && new Date() > new Date(car.auction_end)) throw createError({ statusCode: 400, statusMessage: 'Auction has ended' })
    if (car.seller_id === user.id) throw createError({ statusCode: 400, statusMessage: 'You cannot bid on your own car' })

    const minBid = parseFloat(car.current_bid || car.starting_price || 0) + 50
    if (bidAmount < minBid) throw createError({ statusCode: 400, statusMessage: `Bid must be at least CHF ${minBid}` })

    // Outbid previous
    await supabase.from('bids').update({ status: 'outbid' }).eq('car_id', carId).eq('status', 'pending')

    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({ car_id: parseInt(carId), user_id: user.id, amount: bidAmount, status: 'pending' })
      .select()
      .single()

    if (bidError) throw bidError

    await supabase.from('cars').update({
      current_bid: bidAmount,
      highest_bidder_id: user.id,
      bid_count: (car.bid_count || 0) + 1,
    }).eq('id', carId)

    const newBalance = previousBalance - bidAmount
    await supabase.from('users').update({ funds: newBalance }).eq('id', user.id)
    await supabase.from('transaction_logs').insert({
      user_id: user.id,
      type: 'bid_payment',
      amount: -bidAmount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      description: `Bid on ${car.make} ${car.model}`,
      car_id: parseInt(carId),
    })

    return {
      success: true,
      bid: { id: bid.id, amount: bid.amount },
      currentBid: bidAmount,
      bidCount: (car.bid_count || 0) + 1,
      user: { newBalance },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to place bid' })
  }
})
