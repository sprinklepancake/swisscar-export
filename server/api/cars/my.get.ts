// server/api/cars/my.get.ts - NEW FILE
import jwt from 'jsonwebtoken'
import { Car } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in'
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
    
    // Get user's cars
    const cars = await Car.findAll({
      where: { sellerId: userId },
      order: [['createdAt', 'DESC']]
    })
    
    return cars.map(car => ({
      id: car.getDataValue('id'),
      make: car.getDataValue('make'),
      model: car.getDataValue('model'),
      year: car.getDataValue('year'),
      price: car.getDataValue('price'),
      startingPrice: car.getDataValue('startingPrice'),
      mileage: car.getDataValue('mileage'),
      images: car.getDataValue('images'),
      status: car.getDataValue('status'),
      city: car.getDataValue('city'),
      canton: car.getDataValue('canton'),
      createdAt: car.getDataValue('createdAt'),
      isFeatured: car.getDataValue('isFeatured'),
      featuredUntil: car.getDataValue('featuredUntil'),
      listingType: car.getDataValue('listingType'),
      auctionEnd: car.getDataValue('auctionEnd'),
      bidCount: car.getDataValue('bidCount')
    }))
    
  } catch (error: any) {
    console.error('❌ Error getting user cars:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})