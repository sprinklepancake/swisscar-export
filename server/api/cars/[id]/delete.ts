// server/api/cars/[id]/delete.ts - ADD Message IMPORT
import { Car, Bid, Chat, Message, Watchlist } from '~/server/database/models'
import jwt from 'jsonwebtoken'
import { defineEventHandler, createError, getRouterParam, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Get car ID
    const carId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!carId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }
    
    // Get authenticated user from token
    const accessToken = getCookie(event, 'access_token')
    
    console.log('🗑️ Delete API - Car ID:', carId)
    console.log('🗑️ Delete API - Access token present:', !!accessToken)
    
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in to delete listings'
      })
    }
    
    const config = useRuntimeConfig()
    let userId: number = 0
    let userRole: string = ''
    
    try {
      const decodedToken = jwt.verify(accessToken, config.jwtAccessSecret) as any
      userId = decodedToken.userId || decodedToken.id
      userRole = decodedToken.role
      
      console.log('🗑️ Delete API - User from token:', { userId, userRole })
    } catch (jwtError) {
      console.error('🗑️ Delete API - JWT verification failed:', jwtError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
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
    
    console.log('🗑️ Delete API - Car found:', { 
      id: car.id, 
      sellerId: car.sellerId, 
      userId,
      isOwner: car.sellerId === userId,
      userRole 
    })
    
    // Check permissions
    if (car.sellerId !== userId && userRole !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own listings'
      })
    }
    
    console.log('🔄 Deleting car ID:', carId, 'by user ID:', userId)
    console.log('   Deleting related records...')
    
    // 1. Delete bids associated with this car
    await Bid.destroy({
      where: { carId: carId }
    })
    console.log('   ✓ Deleted related bids')
    
    // 2. Delete watchlist items for this car
    await Watchlist.destroy({
      where: { carId: carId }
    })
    console.log('   ✓ Deleted watchlist entries')
    
    // 3. Delete messages from chats associated with this car
    //    Must delete messages before chats due to foreign key
    const chats = await Chat.findAll({
      where: { carId: carId },
      attributes: ['id']
    })
    
    const chatIds = chats.map(chat => chat.id)
    
    if (chatIds.length > 0) {
      await Message.destroy({
        where: { chatId: chatIds }
      })
      console.log('   ✓ Deleted related messages')
    }
    
    // 4. Now delete the chats
    await Chat.destroy({
      where: { carId: carId }
    })
    console.log('   ✓ Deleted related chats')
    
    // 5. Finally delete the car
    await car.destroy()
    console.log('✅ Car deleted successfully:', carId)
    
    return {
      success: true,
      message: 'Listing deleted successfully'
    }
  } catch (error: any) {
    console.error('❌ Delete car error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to delete listing'
    })
  }
})