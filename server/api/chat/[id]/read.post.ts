// server/api/chat/[id]/read.post.ts
import { Message } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    const auth = await requireAuth(event)
    const userId = auth.id
    
    const chatId = getRouterParam(event, 'id')
    
    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: 'Chat ID is required'
      })
    }
    
    // Mark all messages from other users as read
    await Message.update(
      { read: true },
      {
        where: {
          chatId: parseInt(chatId),
          senderId: { [Op.ne]: userId }, // Not equal to current user
          read: false
        }
      }
    )
    
    return {
      success: true,
      message: 'Messages marked as read'
    }
    
  } catch (error: any) {
    console.error('Error marking messages as read:', error)
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to mark messages as read'
    })
  }
})