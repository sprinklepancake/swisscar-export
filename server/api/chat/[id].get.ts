// server/api/chat/[id].get.ts
import { Chat, Message, User, Car } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'
import { getUserName } from '~/server/utils/userHelpers' // ADD THIS
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== GET CHAT API ===')
    
    // Get authenticated user
    const auth = await requireAuth(event)
    const userId = auth.id
    
    console.log('👤 Current user from requireAuth:', {
      id: auth.id,
      name: auth.name, // This should now be properly set
      email: auth.email,
      role: auth.role
    })
    
    // Get chat ID
    const chatId = event.context.params?.id || getRouterParam(event, 'id')

    if (!chatId) {
      throw createError({
        statusCode: 400,
        message: 'Chat ID is required'
      })
    }

    console.log('💬 Fetching chat with ID:', chatId)

    // Get the chat with all related data
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
          attributes: ['id', 'name', 'email', 'profileImage', 'phone'] 
        },
        { 
          model: User, 
          as: 'seller', 
          attributes: ['id', 'name', 'email', 'profileImage', 'phone'] 
        },
        {
          model: Car,
          as: 'car',
          attributes: [
            'id', 'make', 'model', 'year', 'price', 'mileage', 'images', 
            'city', 'canton', 'status', 'listingType', 'fuelType', 'transmission',
            'color', 'condition', 'engineSize', 'powerPs', 'doors', 'seats',
            'withWarranty', 'validInspection', 'hasAccident', 'exportDocuments'
          ]
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

    console.log('✅ Chat found. Users:', {
      buyer: chat.buyer ? { id: chat.buyer.id, name: getUserName(chat.buyer) } : 'No buyer',
      seller: chat.seller ? { id: chat.seller.id, name: getUserName(chat.seller) } : 'No seller'
    })

    // Get all messages
    const messages = await Message.findAll({
      where: { chatId: parseInt(chatId) },
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['id', 'name', 'profileImage'] 
        }
      ],
      order: [['createdAt', 'ASC']]
    })

    console.log(`📨 Found ${messages.length} messages`)

    // Mark messages as read
    const unreadMessages = await Message.findAll({
      where: {
        chatId: parseInt(chatId),
        senderId: { [Op.ne]: userId },
        read: false
      }
    })

    if (unreadMessages.length > 0) {
      console.log(`📖 Marking ${unreadMessages.length} messages as read`)
      await Message.update(
        { read: true },
        {
          where: {
            chatId: parseInt(chatId),
            senderId: { [Op.ne]: userId },
            read: false
          }
        }
      )
    }

    // Determine user roles
    const isCurrentUserSeller = chat.sellerId === userId
    const otherUser = isCurrentUserSeller ? chat.buyer : chat.seller

    console.log('👥 Role info:', {
      isCurrentUserSeller,
      currentUserName: auth.name,
      otherUserName: getUserName(otherUser)
    })

    // Prepare car info
    const carInfo = chat.car ? {
      id: chat.car.id,
      make: chat.car.make,
      model: chat.car.model,
      year: chat.car.year,
      price: chat.car.price,
      mileage: chat.car.mileage,
      images: chat.car.images || [],
      city: chat.car.city,
      canton: chat.car.canton,
      status: chat.car.status,
      listingType: chat.car.listingType
    } : null

    // Prepare messages with proper sender names
    const formattedMessages = messages.map(msg => {
      let senderName = 'User'
      
      console.log(`Processing message ${msg.id}:`, {
        senderId: msg.senderId,
        senderObject: msg.sender,
        senderNameAttempt: getUserName(msg.sender)
      })

      // Use the helper function to safely get the name
      senderName = getUserName(msg.sender)
      
      console.log(`✅ Final sender name for message ${msg.id}: ${senderName}`)

      return {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: senderName,
        senderImage: msg.sender?.profileImage,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        read: msg.read
      }
    })

    // Prepare response
    const response = {
      chat: {
        id: chat.id,
        carId: chat.carId,
        buyerId: chat.buyerId,
        sellerId: chat.sellerId,
        buyer: chat.buyer ? {
          id: chat.buyer.id,
          name: getUserName(chat.buyer) || 'Buyer',
          email: chat.buyer.email,
          profileImage: chat.buyer.profileImage,
          phone: chat.buyer.phone
        } : null,
        seller: chat.seller ? {
          id: chat.seller.id,
          name: getUserName(chat.seller) || 'Seller',
          email: chat.seller.email,
          profileImage: chat.seller.profileImage,
          phone: chat.seller.phone
        } : null,
        car: carInfo,
        isCurrentUserSeller: isCurrentUserSeller,
        otherUserName: getUserName(otherUser) || 'User',
        otherUserEmail: otherUser?.email,
        otherUserPhone: otherUser?.phone,
        otherUserImage: otherUser?.profileImage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages: formattedMessages
    }

    console.log('✅ Final response check:', {
      authUserName: auth.name,
      chatBuyerName: response.chat.buyer?.name,
      chatSellerName: response.chat.seller?.name,
      chatOtherUserName: response.chat.otherUserName,
      messageNames: response.messages.map(m => m.senderName)
    })
    
    return response

  } catch (error: any) {
    console.error('❌ Get chat error:', error)
    console.error('❌ Error stack:', error.stack)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch chat'
    })
  }
})