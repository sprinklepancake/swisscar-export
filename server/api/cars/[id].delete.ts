// server/api/cars/[id].delete.ts - NEW FILE
import { Car } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user || event.context.auth
    
    if (!user || !user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const carId = event.context.params?.id
    
    if (!carId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }

    // Find the car
    const car = await Car.findByPk(carId)
    
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }

    // Check if user owns this car
    if (car.sellerId !== user.id && user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own listings'
      })
    }

    // Delete the car
    await car.destroy()

    return {
      success: true,
      message: 'Listing deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete car error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to delete listing'
    })
  }
})