import { Chat, Message, User, Car } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const carId = getRouterParam(event, 'carId')
  const sellerId = getRouterParam(event, 'sellerId')
  
  if (!carId || !sellerId) {
    throw createError({ statusCode: 400, message: 'Missing carId or sellerId' })
  }
  
  try {
    // Verify car and seller exist first
    const car = await Car.findByPk(parseInt(carId))
    const seller = await User.findByPk(parseInt(sellerId))
    
    if (!car) {
      throw createError({ statusCode: 404, message: 'Car not found' })
    }
    
    if (!seller) {
      throw createError({ statusCode: 404, message: 'Seller not found' })
    }

    // Find or create chat
    let chat = await Chat.findOne({
      where: { 
        carId: parseInt(carId),
        sellerId: parseInt(sellerId),
        buyerId: user.id
      },
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' }
      ]
    })

    if (!chat) {
      console.log('Creating new chat...')
      chat = await Chat.create({
        carId: parseInt(carId),
        sellerId: parseInt(sellerId),
        buyerId: user.id,
        lastMessageAt: new Date()
      })
      
      // Reload with associations
      chat = await Chat.findByPk(chat.id, {
        include: [
          { model: User, as: 'buyer' },
          { model: User, as: 'seller' }
        ]
      })
    }

    // Get messages for this chat
    const messages = await Message.findAll({
      where: { chatId: chat.id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    })

    return { 
      chat: {
        id: chat.id,
        buyerId: chat.buyerId,
        sellerId: chat.sellerId,
        carId: chat.carId,
        lastMessageAt: chat.lastMessageAt
      },
      messages 
    }
  } catch (error: any) {
    console.error('Chat error:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Failed to load chat: ' + error.message 
    })
  }
})