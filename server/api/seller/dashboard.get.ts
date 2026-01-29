// server/api/seller/dashboard.get.ts
import { Car } from '~/server/database/models'
import { getUserById } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    // Try both possible auth contexts
    const user = event.context.user || event.context.auth
    
    console.log('Dashboard API - Context user:', user)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Additional seller check
    if (user.role !== 'seller') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Seller access only'
      })
    }

    // Get user's actual data from database
    const dbUser = await getUserById(user.id)
    if (!dbUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Get user's cars from database
    const userCars = await Car.findAll({
      where: { sellerId: user.id },
      order: [['createdAt', 'DESC']]
    })

    // Calculate statistics
    const activeListings = userCars.filter(car => car.status === 'active' || car.status === 'auction').length
    const soldCars = userCars.filter(car => car.status === 'sold').length
    const totalCars = userCars.length
    
    // Calculate earnings (simplified - you'll need to implement actual transaction logic)
    const totalEarnings = userCars
      .filter(car => car.status === 'sold')
      .reduce((sum, car) => sum + parseFloat(car.price || 0), 0)
    
    // Monthly earnings (last 30 days)
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    
    const monthlyEarnings = userCars
      .filter(car => car.status === 'sold' && new Date(car.updatedAt) > oneMonthAgo)
      .reduce((sum, car) => sum + parseFloat(car.price || 0), 0)

    // Recent sales
    const recentSales = userCars
      .filter(car => car.status === 'sold')
      .slice(0, 5)
      .map(car => ({
        id: car.id,
        car: `${car.make} ${car.model}`,
        price: car.price,
        date: car.updatedAt
      }))

    // Listings with more details
    const listings = userCars.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      startingPrice: car.startingPrice,
      status: car.status,
      views: car.views || 0,
      isFeatured: car.isFeatured && car.featuredUntil && new Date(car.featuredUntil) > new Date(),
      listingType: car.listingType,
      auctionEnd: car.auctionEnd,
      currentBid: car.currentBid,
      bidCount: car.bidCount || 0,
      createdAt: car.createdAt,
      updatedAt: car.updatedAt
    }))

    // Get user's real balance
    const userBalance = parseFloat(dbUser.getDataValue('funds')) || 0

    return {
      user: {
        name: dbUser.getDataValue('name'),
        funds: userBalance
      },
      stats: {
        activeListings,
        totalCars: totalCars,
        totalEarnings,
        monthlyEarnings,
        soldCars
      },
      recentSales,
      listings
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})