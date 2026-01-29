// server/api/admin/listings/[id].delete.ts - FIXED WITH MESSAGES
import { Car, Bid, Chat, Message, Watchlist } from '~/server/database/models'
import { defineEventHandler, createError, getRouterParam } from 'h3'

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
    
    console.log('🔄 Admin deleting car ID:', listingId)
    console.log('   Deleting related records...')
    
    // Delete related records in CORRECT ORDER:
    
    // 1. Delete bids associated with this car
    await Bid.destroy({
      where: { carId: listingId }
    })
    console.log('   ✓ Deleted related bids')
    
    // 2. Delete watchlist items for this car
    await Watchlist.destroy({
      where: { carId: listingId }
    })
    console.log('   ✓ Deleted watchlist entries')
    
    // 3. Delete messages from chats associated with this car
    //    Must delete messages before chats due to foreign key
    const chats = await Chat.findAll({
      where: { carId: listingId },
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
      where: { carId: listingId }
    })
    console.log('   ✓ Deleted related chats')
    
    // 5. Finally delete the car
    await car.destroy()
    console.log('✅ Car deleted successfully by admin')
    
    return {
      success: true,
      message: 'Listing removed successfully'
    }
  } catch (error: any) {
    console.error('❌ Error removing listing:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to remove listing'
    })
  }
})