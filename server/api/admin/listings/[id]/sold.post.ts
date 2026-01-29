// server/api/admin/listings/[id]/sold.post.ts
import { Car } from '~/server/database/models/Car'

export default defineEventHandler(async (event) => {
  try {
    const listingId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!listingId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid listing ID'
      })
    }
    
    const car = await Car.findByPk(listingId)
    
    if (!car) {
      throw createError({
        statusCode: 404,
        message: 'Listing not found'
      })
    }
    
    await car.update({ status: 'sold' })
    
    return {
      success: true,
      message: 'Listing marked as sold'
    }
  } catch (error) {
    console.error('Error marking listing as sold:', error)
    return {
      success: false,
      error: 'Failed to update listing'
    }
  }
})