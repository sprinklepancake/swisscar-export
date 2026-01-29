// server/api/bids/create.post.ts - FIXED VERSION
import { User } from '../../database/models/User'
import { Car } from '../../database/models/Car'
import { Bid } from '../../database/models/Bid'
import { TransactionLog } from '../../database/models/TransactionLog'
import { ActivityLog } from '../../database/models/ActivityLog'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const { carId, amount } = await readBody(event)
    
    // Get user ID from context - FIXED VERSION
    const userFromContext = event.context.auth
    const userId = userFromContext?.id || userFromContext?.userId
    
    console.log('Bid creation - User from context:', userFromContext)
    console.log('Bid creation - Extracted user ID:', userId)

    if (!userId) {
      // Fallback: try to get from token directly
      const accessToken = getCookie(event, 'access_token')
      if (accessToken) {
        try {
          const config = useRuntimeConfig()
          const decoded = jwt.verify(accessToken, config.jwtAccessSecret) as any
          const fallbackUserId = decoded.userId || decoded.id
          console.log('Got user ID from token fallback:', fallbackUserId)
          
          if (fallbackUserId) {
            // Use the fallback user ID - create a simplified version with just the fallback logic
            const user = await User.findByPk(fallbackUserId)
            if (!user) {
              throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
              })
            }
            
            // Check if banned - using getDataValue()
            if (user.getDataValue('banned')) {
              throw createError({
                statusCode: 403,
                statusMessage: 'Your account has been banned from placing bids'
              })
            }

            // Check if user is verified to bid - USING getDataValue()
            if (!user.getDataValue('verified')) {
              throw createError({
                statusCode: 403,
                statusMessage: 'Only verified users can place bids. Please contact admin to get verified.'
              })
            }

            // Check if user has enough funds - using getDataValue()
            const previousBalance = parseFloat(user.getDataValue('funds')) || 0
            if (previousBalance < amount) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Insufficient funds'
              })
            }

            // Verify car exists and is in auction
            const car = await Car.findByPk(carId, {
              include: [{
                association: 'seller',
                attributes: ['id', 'name', 'email']
              }]
            })
            
            if (!car) {
              throw createError({
                statusCode: 404,
                statusMessage: 'Car not found'
              })
            }

            // Check if auction is active
            if (car.listingType !== 'auction' || (car.status !== 'auction' && car.status !== 'active')) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Car not available for bidding'
              })
            }

            // Check if auction has ended
            if (car.auctionEnd && new Date() > new Date(car.auctionEnd)) {
              throw createError({
                statusCode: 400,
                statusMessage: 'Auction has ended'
              })
            }

            // Check if user is trying to bid on their own car
            if (car.sellerId === fallbackUserId) {
              throw createError({
                statusCode: 400,
                statusMessage: 'You cannot bid on your own car'
              })
            }

            // Get current highest bid
            const highestBid = await Bid.findOne({
              where: { 
                carId, 
                status: 'pending'
              },
              order: [['amount', 'DESC']]
            })

            // Calculate minimum bid (current highest + minimum increment of 50 CHF)
            const minBid = highestBid 
              ? parseFloat(highestBid.amount) + 50 
              : parseFloat(car.startingPrice)

            if (amount < minBid) {
              throw createError({
                statusCode: 400,
                statusMessage: `Bid must be at least ${minBid.toFixed(2)} CHF`
              })
            }

            // Create bid
            const bid = await Bid.create({
              carId,
              userId: fallbackUserId,
              amount,
              status: 'pending'
            })

            // Update user funds
            const newBalance = previousBalance - amount
            await user.update({
              funds: newBalance
            })

            // Update car with new highest bid
            await car.update({
              currentBid: amount,
              highestBidderId: fallbackUserId,
              bidCount: car.bidCount + 1
            })

            // Log transaction
            await TransactionLog.create({
              userId: fallbackUserId,
              type: 'payment',
              amount: -amount,
              previousBalance,
              newBalance,
              description: `Bid placed on ${car.make} ${car.model} (ID: ${car.id})`,
              referenceId: `BID-${bid.id}`,
              metadata: {
                carId,
                carMake: car.make,
                carModel: car.model,
                bidId: bid.id
              }
            })

            // Log activity
            await ActivityLog.create({
              userId: fallbackUserId,
              type: 'bid_placed',
              action: 'Bid Placed',
              description: `Placed bid of ${amount} CHF on ${car.make} ${car.model}`,
              metadata: {
                carId,
                carMake: car.make,
                carModel: car.model,
                amount,
                bidId: bid.id
              },
              ipAddress: event.node.req.socket.remoteAddress,
              userAgent: event.node.req.headers['user-agent']
            })

            return {
              success: true,
              bid: {
                id: bid.id,
                amount: bid.amount,
                createdAt: bid.createdAt,
                timeRemaining: car.getTimeRemaining(),
                isHighestBidder: true
              },
              car: {
                id: car.id,
                make: car.make,
                model: car.model,
                currentBid: amount,
                bidCount: car.bidCount + 1,
                auctionEnd: car.auctionEnd,
                timeRemaining: car.getTimeRemaining()
              },
              user: {
                newBalance
              }
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error)
        }
      }
      
      // If we still don't have a user ID
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Verify user exists
    const user = await User.findByPk(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    console.log('Bid creation - User verification check:', {
      userId: user.getDataValue('id'),
      email: user.getDataValue('email'),
      verified: user.getDataValue('verified'),
      banned: user.getDataValue('banned'),
      funds: user.getDataValue('funds')
    })

    // Check if banned - using getDataValue()
    if (user.getDataValue('banned')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Your account has been banned from placing bids'
      })
    }

    // Check if user is verified to bid - USING getDataValue()
    if (!user.getDataValue('verified')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only verified users can place bids. Please contact admin to get verified.'
      })
    }

    // Check if user has enough funds - using getDataValue()
    const previousBalance = parseFloat(user.getDataValue('funds')) || 0
    if (previousBalance < amount) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient funds'
      })
    }

    // Verify car exists and is in auction
    const car = await Car.findByPk(carId, {
      include: [{
        association: 'seller',
        attributes: ['id', 'name', 'email']
      }]
    })
    
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }

    // Check if auction is active
    if (car.listingType !== 'auction' || (car.status !== 'auction' && car.status !== 'active')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car not available for bidding'
      })
    }

    // Check if auction has ended
    if (car.auctionEnd && new Date() > new Date(car.auctionEnd)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Auction has ended'
      })
    }

    // Check if user is trying to bid on their own car
    if (car.sellerId === userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You cannot bid on your own car'
      })
    }

    // Get current highest bid
    const highestBid = await Bid.findOne({
      where: { 
        carId, 
        status: 'pending'
      },
      order: [['amount', 'DESC']]
    })

    // Calculate minimum bid (current highest + minimum increment of 50 CHF)
    const minBid = highestBid 
      ? parseFloat(highestBid.amount) + 50 
      : parseFloat(car.startingPrice)

    if (amount < minBid) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bid must be at least ${minBid.toFixed(2)} CHF`
      })
    }

    // Create bid
    const bid = await Bid.create({
      carId,
      userId,
      amount,
      status: 'pending'
    })

    // Update user funds
    const newBalance = previousBalance - amount
    await user.update({
      funds: newBalance
    })

    // Update car with new highest bid
    await car.update({
      currentBid: amount,
      highestBidderId: userId,
      bidCount: car.bidCount + 1
    })

    // Log transaction
    await TransactionLog.create({
      userId,
      type: 'payment',
      amount: -amount,
      previousBalance,
      newBalance,
      description: `Bid placed on ${car.make} ${car.model} (ID: ${car.id})`,
      referenceId: `BID-${bid.id}`,
      metadata: {
        carId,
        carMake: car.make,
        carModel: car.model,
        bidId: bid.id
      }
    })

    // Log activity
    await ActivityLog.create({
      userId,
      type: 'bid_placed',
      action: 'Bid Placed',
      description: `Placed bid of ${amount} CHF on ${car.make} ${car.model}`,
      metadata: {
        carId,
        carMake: car.make,
        carModel: car.model,
        amount,
        bidId: bid.id
      },
      ipAddress: event.node.req.socket.remoteAddress,
      userAgent: event.node.req.headers['user-agent']
    })

    return {
      success: true,
      bid: {
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
        timeRemaining: car.getTimeRemaining(),
        isHighestBidder: true
      },
      car: {
        id: car.id,
        make: car.make,
        model: car.model,
        currentBid: amount,
        bidCount: car.bidCount + 1,
        auctionEnd: car.auctionEnd,
        timeRemaining: car.getTimeRemaining()
      },
      user: {
        newBalance
      }
    }

  } catch (error: any) {
    console.error('Bid creation error:', error)
    
    // Return specific error message if available
    if (error.statusCode && error.statusMessage) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to place bid',
      data: error.message
    })
  }
})