// server/api/chat/index.get.ts - FIXED VERSION
import { Chat, Message, User, Car } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'
import { getUserName } from '~/server/utils/userHelpers' // ADD THIS
import { Op } from 'sequelize'
import { QueryTypes } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    console.log('📱 Fetching chats for user...')
    
    const auth = await requireAuth(event)
    const userId = auth.id
    
    console.log('👤 Current user:', { id: userId, name: auth.name })
    
    // Get all chats for the user
    const chats = await Chat.findAll({
      where: {
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
        },
        {
          model: Car,
          as: 'car',
          attributes: ['id', 'make', 'model', 'year', 'price', 'images', 'city', 'canton']
        }
      ],
      order: [['lastMessageAt', 'DESC']]
    })

    console.log(`📱 Found ${chats.length} chats`)
    
    // Get last message for each chat
    const chatIds = chats.map(chat => chat.id)
    let lastMessages = []
    
    if (chatIds.length > 0) {
      // Use raw query to get last message for each chat efficiently
      const query = `
        SELECT Message.*, sender.id as "sender.id", sender.name as "sender.name"
        FROM (
          ${chatIds.map(id => `
            SELECT * FROM (
              SELECT id, content, senderId, chatId, read, createdAt, updatedAt 
              FROM messages 
              WHERE chatId = ${id} 
              ORDER BY createdAt DESC 
              LIMIT 1
            ) AS sub
          `).join(' UNION ')}
        ) AS Message
        LEFT OUTER JOIN users AS sender ON Message.senderId = sender.id
      `
      
      lastMessages = await Chat.sequelize.query(query, {
        type: QueryTypes.SELECT,
        nest: true,
        raw: true
      })
    }

    // Get unread counts
    const unreadCounts = await Message.findAll({
      where: {
        chatId: { [Op.in]: chatIds },
        senderId: { [Op.ne]: userId },
        read: false
      },
      attributes: ['chatId', [Chat.sequelize.fn('COUNT', Chat.sequelize.col('id')), 'count']],
      group: ['chatId'],
      raw: true
    })

    // Create a map of chatId -> unread count
    const unreadMap = {}
    unreadCounts.forEach(item => {
      unreadMap[item.chatId] = parseInt(item.count)
    })

    // Create a map of chatId -> last message
    const lastMessageMap = {}
    lastMessages.forEach(msg => {
      lastMessageMap[msg.chatId] = msg
    })

    // Format response
    const formattedChats = chats.map(chat => {
      const isCurrentUserSeller = chat.sellerId === userId
      const otherUser = isCurrentUserSeller ? chat.buyer : chat.seller
      
      // USE getUserName HERE - THIS IS CRITICAL!
      const otherUserName = getUserName(otherUser) || 'User'
      
      console.log(`💬 Chat ${chat.id}:`, {
        currentUserIsSeller: isCurrentUserSeller,
        otherUser: otherUser,
        extractedName: otherUserName,
        buyerName: getUserName(chat.buyer),
        sellerName: getUserName(chat.seller)
      })

      const lastMessage = lastMessageMap[chat.id]
      const formattedLastMessage = lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        senderId: lastMessage.senderId,
        senderName: getUserName(lastMessage.sender) || 'User', // USE getUserName
        createdAt: lastMessage.createdAt
      } : null

      return {
        id: chat.id,
        carId: chat.carId,
        sellerId: chat.sellerId,
        buyerId: chat.buyerId,
        otherUserId: otherUser?.id,
        otherUserName: otherUserName, // This should now be correct
        otherUserEmail: otherUser?.email,
        carInfo: chat.car ? `${chat.car.make} ${chat.car.model}` : 'Car',
        car: chat.car ? {
          id: chat.car.id,
          make: chat.car.make,
          model: chat.car.model,
          year: chat.car.year,
          price: chat.car.price,
          images: chat.car.images,
          city: chat.car.city,
          canton: chat.car.canton
        } : null,
        carYear: chat.car?.year,
        carPrice: chat.car?.price,
        lastMessage: formattedLastMessage,
        unreadCount: unreadMap[chat.id] || 0,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    })

    console.log('✅ Returning chats with names:', formattedChats.map(c => ({
      id: c.id,
      otherUserName: c.otherUserName,
      hasName: c.otherUserName !== 'User'
    })))

    return {
      success: true,
      chats: formattedChats
    }

  } catch (error: any) {
    console.error('❌ Error fetching chats:', error)
    
    return {
      success: false,
      message: error.message || 'Failed to fetch chats',
      chats: []
    }
  }
})