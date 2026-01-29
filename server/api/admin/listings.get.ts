// server/api/admin/listings.get.ts
import { Car } from '~/server/database/models/Car'
import { getUserById } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    const cars = await Car.findAll({
      include: ['seller'],
      order: [['createdAt', 'DESC']]
    })
    
    const listings = await Promise.all(cars.map(async (car: any) => {
      let sellerName = 'Unknown'
      if (car.sellerId) {
        const seller = await getUserById(car.sellerId)
        sellerName = seller?.getDataValue('name') || 'Unknown'
      }
      
      return {
        id: car.getDataValue('id'),
        title: car.getDataValue('title'),
        description: car.getDataValue('description'),
        price: car.getDataValue('price'),
        auction: car.getDataValue('auction'),
        type: car.getDataValue('auction') ? 'auction' : 'normal',
        status: car.getDataValue('status') || 'active',
        sellerId: car.getDataValue('sellerId'),
        sellerName: sellerName,
        createdAt: car.getDataValue('createdAt'),
        updatedAt: car.getDataValue('updatedAt')
      }
    }))
    
    return {
      success: true,
      listings
    }
  } catch (error) {
    console.error('Error getting listings:', error)
    return {
      success: false,
      error: 'Failed to fetch listings'
    }
  }
})