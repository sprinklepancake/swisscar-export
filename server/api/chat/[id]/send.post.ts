// server/api/chat/[id]/send.post.ts - FIXED VERSION
import { Chat, Message, User, Car } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'
import { getUserName } from '~/server/utils/userHelpers'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== SEND MESSAGE API ===')
    
    // Get authenticated user
    const auth = await requireAuth(event)
    const userId = auth.id
    
    console.log('👤 Current user ID:', userId)
    console.log('👤 Current user name:', auth.name)
    
    // FIX: Get chat ID correctly - don't reassign const
    let chatId = getRouterParam(event, 'id')
    
    console.log('💬 Chat ID from getRouterParam:', chatId)
    
    // If getRouterParam doesn't work, try context
    if (!chatId) {
      console.log('⚠️ getRouterParam returned undefined, trying event.context.params')
      console.log('Event context params:', event.context.params)
      
      // Try alternative methods
      const url = getRequestURL(event)
      console.log('Request URL:', url.pathname)
      
      // Extract from URL path
      const pathParts = url.pathname.split('/')
      console.log('Path parts:', pathParts)
      
      // The pattern is /api/chat/[id]/send, so id should be at index 3
      const idFromPath = pathParts[3]
      console.log('ID from path:', idFromPath)
      
      if (idFromPath && !isNaN(parseInt(idFromPath))) {
        chatId = idFromPath
        console.log('✅ Using ID from path:', chatId)
      }
    }
    
    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: 'Chat ID is required'
      })
    }

    // Get request body
    const body = await readBody(event)
    const { content } = body

    if (!content || !content.trim()) {
      throw createError({
        statusCode: 400,
        message: 'Message content is required'
      })
    }

    console.log('📝 Message content:', content)
    console.log('💬 Sending to chat ID:', chatId)

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      where: {
        id: parseInt(chatId),
        [Op.or]: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: [
        { 
          model: User, 
          as: 'buyer', 
          attributes: ['id', 'name', 'email'] 
        },
        { 
          model: User, 
          as: 'seller', 
          attributes: ['id', 'name', 'email'] 
        }
      ]
    })

    if (!chat) {
      console.log('❌ Chat not found or access denied')
      throw createError({
        statusCode: 404,
        message: 'Chat not found or access denied'
      })
    }

    console.log('✅ Chat found, users:', {
      buyerName: getUserName(chat.buyer),
      sellerName: getUserName(chat.seller),
      buyerId: chat.buyerId,
      sellerId: chat.sellerId
    })

    // Create the message
    const message = await Message.create({
      content: content.trim(),
      senderId: userId,
      chatId: parseInt(chatId),
      read: false
    })

    // Update chat's last message timestamp
    await chat.update({
      lastMessageAt: new Date()
    })

    // Get the message with sender info
    const messageWithSender = await Message.findOne({
      where: { id: message.id },
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'profileImage'] 
        }
      ]
    })

    console.log('✅ Message created:', {
      id: messageWithSender?.id,
      content: messageWithSender?.content,
      senderId: messageWithSender?.senderId,
      senderName: getUserName(messageWithSender?.sender)
    })

    return {
      success: true,
      message: {
        id: messageWithSender?.id,
        content: messageWithSender?.content,
        senderId: messageWithSender?.senderId,
        senderName: getUserName(messageWithSender?.sender) || auth.name || 'You',
        senderImage: messageWithSender?.sender?.profileImage,
        createdAt: messageWithSender?.createdAt,
        updatedAt: messageWithSender?.updatedAt,
        read: messageWithSender?.read
      }
    }

  } catch (error: any) {
    console.error('❌ Send message error:', error)
    console.error('❌ Error stack:', error.stack)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send message'
    })
  }
})