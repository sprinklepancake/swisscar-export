// server/api/cars/[id]/bid.post.ts - FIXED VERSION WITH TRANSACTION LOGGING
import jwt from 'jsonwebtoken'
import { TransactionLog } from '~/server/database/models/TransactionLog'

export default defineEventHandler(async (event) => {
  try {
    const carId = event.context.params?.id
    if (!carId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }
    
    // Get authenticated user
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in to place a bid'
      })
    }
    
    const config = useRuntimeConfig()
    
    if (!config.jwtAccessSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      })
    }
    
    let decodedToken: any = null
    
    try {
      decodedToken = jwt.verify(accessToken, config.jwtAccessSecret)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token. Please log in again.'
      })
    }
    
    const userId = decodedToken.userId
    
    // Import user repository functions
    const { getUserById, updateUser } = await import('~/server/database/repositories/userRepository')
    
    // Get user data to check ID verification status
    const user = await getUserById(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // ✅ FIXED: Check correct verification field
    // Use 'verifiedBuyer' instead of 'idVerified'
    if (!user.verifiedBuyer) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You must verify your ID before placing bids'
      })
    }
    
    const body = await readBody(event)
    const { amount } = body
    
    if (!amount || isNaN(parseFloat(amount))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid bid amount is required'
      })
    }
    
    const bidAmount = parseFloat(amount)
    
    // Import car functions
    const { getCarById, updateCar } = await import('~/server/utils/carStorage')
    
    // Get car details
    const car = await getCarById(parseInt(carId))
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }
    
    console.log('🔍 Checking car for bidding:', {
      id: car.id,
      listingType: car.listingType,
      status: car.status,
      auctionEnd: car.auctionEnd,
      currentBid: car.currentBid,
      startingPrice: car.startingPrice,
      sellerId: car.sellerId,
      userId: userId
    })
    
    // ✅ FIXED: Check auction is active
    if (car.listingType !== 'auction') {
      throw createError({
        statusCode: 400,
        statusMessage: 'This car is not listed as an auction'
      })
    }
    
    // In bid.post.ts, add better logging:
    console.log('🔍 Car status check:', {
      listingType: car.listingType,
      status: car.status,
      expectedStatus: 'active',
      isActive: car.status === 'active'
    })

    if (car.status !== 'active') {
      console.log('❌ Auction not active. Status:', car.status)
      throw createError({
        statusCode: 400,
        statusMessage: 'This auction is not active'
      })
    }
    
    // Check if auction has ended
    if (car.auctionEnd) {
      const now = new Date()
      const auctionEnd = new Date(car.auctionEnd)
      if (now > auctionEnd) {
        throw createError({
          statusCode: 400,
          statusMessage: 'This auction has ended'
        })
      }
    }
    
    // Validate bid amount
    if (bidAmount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bid amount must be positive'
      })
    }
    
    const currentBid = car.currentBid || car.startingPrice || 0
    if (bidAmount <= currentBid) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bid must be higher than current bid of CHF ${currentBid}`
      })
    }
    
    // Minimum bid increment (100 CHF or 5%)
    const minIncrement = Math.max(100, currentBid * 0.05)
    if (bidAmount < currentBid + minIncrement) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bid must be at least CHF ${minIncrement.toFixed(2)} higher than current bid`
      })
    }
    
    // Check if user is the seller (no self-bidding)
    if (car.sellerId === userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot bid on your own auction'
      })
    }
    
    // Check if user has sufficient funds
    const userFunds = parseFloat(user.funds) || 0
    if (userFunds < bidAmount) {
      throw createError({
        statusCode: 402,
        statusMessage: `Insufficient funds. You need ${bidAmount} CHF to place this bid. Your current balance is ${userFunds} CHF.`
      })
    }
    
    // Import bid functions
    const { createBid } = await import('~/server/database/repositories/bidRepository')
    
    // Create bid record
    const bid = await createBid({
      carId: parseInt(carId),
      userId: userId,
      amount: bidAmount,
      status: 'pending'
    })
    
    // Calculate new balance
    const newBalance = userFunds - bidAmount
    
    // Update user funds
    await updateUser(userId, { funds: newBalance })
    
    // LOG TRANSACTION FOR BID
    const transactionLog = await TransactionLog.create({
      userId: userId,
      type: 'bid_payment',
      amount: -bidAmount,
      previousBalance: userFunds,
      newBalance: newBalance,
      description: `Bid placed on ${car.make} ${car.model} (Auction ID: ${carId})`,
      referenceId: `BID-${bid.id}`,
      metadata: {
        carId: parseInt(carId),
        carMake: car.make,
        carModel: car.model,
        bidId: bid.id,
        auctionEnd: car.auctionEnd,
        isHighestBid: true,
        listingType: car.listingType,
        sellerId: car.sellerId
      }
    })
    
    console.log('✅ Bid transaction logged:', {
      transactionId: transactionLog.id,
      userId,
      amount: bidAmount,
      newBalance
    })
    
    // Update car with new highest bid
    await updateCar(parseInt(carId), {
      currentBid: bidAmount,
      highestBidderId: userId,
      bidCount: (car.bidCount || 0) + 1
    })
    
    // Get user name for response
    const userName = user.name || `User${userId}`
    
    console.log('✅ Bid placed successfully:', {
      carId: carId,
      userId: userId,
      amount: bidAmount,
      newBidCount: (car.bidCount || 0) + 1,
      transactionId: transactionLog.id
    })
    
    return {
      success: true,
      message: 'Bid placed successfully',
      bid: {
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
        userName: userName
      },
      transaction: {
        id: transactionLog.id,
        type: transactionLog.type,
        amount: transactionLog.amount,
        newBalance: transactionLog.newBalance
      },
      car: {
        currentBid: bidAmount,
        bidCount: (car.bidCount || 0) + 1,
        highestBidderId: userId
      },
      user: {
        newBalance: newBalance
      }
    }
    
  } catch (error: any) {
    console.error('Error placing bid:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})