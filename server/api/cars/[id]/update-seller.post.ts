// server/api/cars/[id]/update-seller.post.ts - FIXED VERSION
import { updateCar } from '~/server/utils/carStorage'
import { getUserByEmail } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Car ID is required'
    })
  }
  
  const body = await readBody(event)
  const { sellerEmail } = body // Accept email instead of sellerId
  
  console.log('🔄 Updating car seller:', { carId: id, sellerEmail })
  
  if (!sellerEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Seller email is required'
    })
  }
  
  try {
    // Find seller by email
    const seller = await getUserByEmail(sellerEmail)
    
    if (!seller) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Seller not found with email: ' + sellerEmail
      })
    }
    
    // UPDATE: Add await here
    const updatedCar = await updateCar(id, { sellerId: seller.id })
    
    if (!updatedCar) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }
    
    return {
      success: true,
      message: 'Car updated with seller ID',
      car: {
        id: updatedCar.id,
        sellerId: updatedCar.sellerId,
        sellerName: updatedCar.sellerName
      }
    }
  } catch (error: any) {
    console.error('Error updating car:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update car: ' + error.message
    })
  }
})