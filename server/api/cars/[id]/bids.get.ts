// server/api/cars/[id]/bids.get.ts - CORRECT VERSION
export default defineEventHandler(async (event) => {
  try {
    const carId = event.context.params?.id
    if (!carId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }
    
    // Get car to verify it's an auction
    const { getCarById } = await import('~/server/utils/carStorage')
    const car = await getCarById(parseInt(carId))
    
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }
    
    // Only show bid history for auctions
    if (car.listingType !== 'auction') {
      return {
        success: true,
        message: 'This is not an auction listing',
        bids: []
      }
    }
    
    console.log('🔍 Fetching bids with user names for car ID:', carId)
    
    // Import the connection from your connection.ts file
    const { sequelize } = await import('~/server/database/connection')
    
    const [bids] = await sequelize.query(`
      SELECT 
        b.id,
        b.amount,
        b.status,
        b.createdAt,
        b.userId,
        u.name as userName,
        u.email as userEmail,
        (c.highestBidderId = b.userId) as isWinning
      FROM Bids b
      LEFT JOIN users u ON b.userId = u.id
      LEFT JOIN Cars c ON b.carId = c.id
      WHERE b.carId = ?
      ORDER BY b.amount DESC
    `, {
      replacements: [parseInt(carId)]
    })
    
    console.log('🔍 Raw SQL result - First bid:', bids[0])
    console.log('🔍 All bids count:', (bids as any[]).length)
    
    // Format bids properly
    const formattedBids = (bids as any[]).map(bid => {
      const amount = parseFloat(bid.amount) || 0
      const userName = bid.userName || `User${bid.userId}`
      
      console.log(`Bid ${bid.id}: user ${bid.userId}, name from DB: "${bid.userName}"`)
      
      return {
        id: bid.id,
        amount: amount,
        status: bid.status,
        createdAt: bid.createdAt,
        userId: bid.userId,
        userName: userName,
        userEmail: bid.userEmail || '',
        isWinning: Boolean(bid.isWinning)
      }
    })
    
    console.log('✅ Formatted bids - First 2:', formattedBids.slice(0, 2))
    
    return {
      success: true,
      carId: parseInt(carId),
      totalBids: formattedBids.length,
      currentBid: car.currentBid,
      startingPrice: car.startingPrice,
      reservePrice: car.reservePrice,
      highestBidderId: car.highestBidderId,
      bids: formattedBids
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching bid history:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})