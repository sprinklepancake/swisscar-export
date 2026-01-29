// server/api/chat/send.post.ts - NEW FILE (create this instead)
import { Message, Chat } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== SEND MESSAGE API ===')
    
    // Get authenticated user
    const auth = await requireAuth(event)
    const userId = auth.id
    
    console.log('👤 Current user ID:', userId)
    
    // Get chat ID and message content from body
    const body = await readBody(event)
    console.log('📥 Request body:', body)
    
    const chatId = body.chatId
    
    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: 'Chat ID is required'
      })
    }
    
    console.log('💬 Chat ID from body:', chatId)
    
    if (!body.content || typeof body.content !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Message content is required'
      })
    }
    
    const content = body.content.trim()
    
    if (!content) {
      throw createError({
        statusCode: 400,
        message: 'Message content cannot be empty'
      })
    }
    
    console.log('📝 Message content:', content)
    
    // Verify user is part of the chat
    console.log('🔍 Verifying user access to chat...')
    const chat = await Chat.findOne({
      where: {
        id: parseInt(chatId),
        [Op.or]: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      }
    })
    
    if (!chat) {
      console.log('❌ Chat not found or access denied')
      throw createError({
        statusCode: 403,
        message: 'Access denied to this chat'
      })
    }
    
    console.log('✅ User has access to chat')
    console.log('📊 Chat details:', {
      id: chat.id,
      buyerId: chat.buyerId,
      sellerId: chat.sellerId,
      carId: chat.carId
    })
    
    // Create the message
    console.log('💾 Creating message...')
    const message = await Message.create({
      chatId: chat.id,
      senderId: userId,
      content: content,
      read: false
    })
    
    console.log('✅ Message created with ID:', message.id)
    
    // Update chat's last message timestamp
    await chat.update({
      lastMessageAt: new Date()
    })
    
    console.log('✅ Chat timestamp updated')
    
    // Return success response
    const response = {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        chatId: message.chatId,
        createdAt: message.createdAt,
        read: message.read
      }
    }
    
    console.log('✅ Returning response:', response)
    return response
    
  } catch (error: any) {
    console.error('❌ Send message error:', error)
    console.error('❌ Error stack:', error.stack)
    
    // If it's already a createError with statusCode, throw it as-is
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise wrap it
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send message'
    })
  }
})