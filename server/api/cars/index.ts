// server/api/cars/index.ts - FIXED VERSION
import { getAllCars } from '~/server/utils/carStorage'

export default defineEventHandler(async (event) => {
  try {
    // ADD AWAIT HERE
    const cars = await getAllCars()
    
    // Handle Sequelize instances - convert to plain objects
    const plainCars = cars.map(car => {
      // If it's a Sequelize instance, use toJSON()
      const carData = car.toJSON ? car.toJSON() : car
      
      return {
        id: carData.id,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        startingPrice: carData.startingPrice,
        mileage: carData.mileage,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        engineSize: carData.engineSize,
        condition: carData.condition,
        color: carData.color,
        canton: carData.canton,
        city: carData.city,
        status: carData.status,
        images: carData.images,
        isFeatured: carData.isFeatured,
        exportDocuments: carData.exportDocuments,
        description: carData.description,
        sellerId: carData.sellerId,
        sellerName: carData.sellerName,
        sellerPhone: carData.sellerPhone,
        sellerEmail: carData.sellerEmail,
        // Include seller object if it exists
        seller: carData.seller,
        createdAt: carData.createdAt,
        updatedAt: carData.updatedAt
      }
    })
    
    return plainCars
  } catch (error) {
    console.error('Error fetching cars:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch cars'
    })
  }
})