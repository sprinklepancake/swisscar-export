// server/api/cars/featured.get.ts - FIXED VERSION
import { Car } from '~/server/database/models'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const limit = query.limit ? parseInt(query.limit as string) : 6
    
    const now = new Date()
    
    // Get ACTIVE featured cars (same logic as admin stats)
    const featuredCars = await Car.findAll({
      where: {
        isFeatured: true,
        status: 'active',
        [Op.or]: [
          // Permanent features
          { permanentFeature: true },
          // Temporary features that are still active
          {
            permanentFeature: false,
            [Op.or]: [
              // Has featuredUntil date in future
              {
                featuredUntil: {
                  [Op.gt]: now
                }
              },
              // OR has no featuredUntil date (should still count as active)
              {
                featuredUntil: null
              }
            ]
          }
        ]
      },
      limit: limit,
      order: [['featuredUntil', 'DESC'], ['createdAt', 'DESC']]
    })
    
    // Convert to plain objects
    const plainCars = featuredCars.map(car => ({
      id: car.getDataValue('id'),
      make: car.getDataValue('make'),
      model: car.getDataValue('model'),
      year: car.getDataValue('year'),
      price: car.getDataValue('price'),
      mileage: car.getDataValue('mileage'),
      fuelType: car.getDataValue('fuelType'),
      transmission: car.getDataValue('transmission'),
      condition: car.getDataValue('condition'),
      images: car.getDataValue('images') || [],
      canton: car.getDataValue('canton'),
      city: car.getDataValue('city'),
      isFeatured: car.getDataValue('isFeatured'),
      featuredUntil: car.getDataValue('featuredUntil'),
      permanentFeature: car.getDataValue('permanentFeature'),
      featuredDaysRemaining: car.getDataValue('featuredUntil') 
        ? Math.max(0, Math.ceil((new Date(car.getDataValue('featuredUntil')).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null
    }))
    
    console.log(`✅ Featured endpoint: Found ${plainCars.length} active featured cars at ${now.toISOString()}`)
    
    return {
      success: true,
      count: plainCars.length,
      featuredCars: plainCars
    }
  } catch (error) {
    console.error('❌ Error fetching featured cars:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch featured cars'
    })
  }
})