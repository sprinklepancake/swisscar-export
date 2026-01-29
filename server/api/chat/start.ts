// server/api/chat/start.ts - NEW FILE
import { Chat, User, Car } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const auth = await requireAuth(event)
    const currentUserId = auth.id
    
    const body = await readBody(event)
    const { carId, sellerEmail } = body

    if (!carId || !sellerEmail) {
      throw createError({
        statusCode: 400,
        message: 'Car ID and seller email are required'
      })
    }

    // Find seller by email
    const seller = await User.findOne({
      where: { email: sellerEmail }
    })

    if (!seller) {
      throw createError({
        statusCode: 404,
        message: 'Seller not found'
      })
    }

    const sellerId = seller.id

    // Don't allow messaging yourself
    if (currentUserId === sellerId) {
      throw createError({
        statusCode: 400,
        message: 'You cannot message yourself'
      })
    }

    // Find or create chat
    let chat = await Chat.findOne({
      where: {
        carId: parseInt(carId),
        sellerId: sellerId,
        buyerId: currentUserId
      }
    })

    if (!chat) {
      chat = await Chat.create({
        carId: parseInt(carId),
        sellerId: sellerId,
        buyerId: currentUserId,
        lastMessageAt: new Date()
      })
    }

    return {
      success: true,
      chatId: chat.id,
      message: 'Chat started successfully'
    }

  } catch (error: any) {
    console.error('Chat start error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to start chat'
    })
  }
})