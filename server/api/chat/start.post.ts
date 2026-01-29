// server/api/chat/start.post.ts - FIXED VERSION
import { Chat, User, Car } from '~/server/database/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CHAT START API ===')
    
    // Get authenticated user
    const auth = await requireAuth(event)
    const currentUserId = auth.id
    
    console.log('👤 Current user ID:', currentUserId)
    console.log('👤 Current user email:', auth.email)
    
    const body = await readBody(event)
    const { carId, sellerEmail } = body

    console.log('📥 Request body:', { carId, sellerEmail })

    // Validate input
    if (!carId || !sellerEmail) {
      console.log('❌ Missing carId or sellerEmail')
      throw createError({
        statusCode: 400,
        message: 'Car ID and seller email are required'
      })
    }

    // Find seller by email - USE RAW QUERY TO ENSURE DATA IS RETURNED
    console.log('🔍 Looking for seller with email:', sellerEmail)
    const seller = await User.findOne({
      where: { email: sellerEmail },
      raw: true // ADD THIS LINE - returns plain JavaScript object
    })

    if (!seller) {
      console.log('❌ Seller not found with email:', sellerEmail)
      throw createError({
        statusCode: 404,
        message: 'Seller not found. The seller may not have an account yet.'
      })
    }

    const sellerId = seller.id
    console.log('✅ Seller found - ID:', sellerId, 'Name:', seller.name)

    // Don't allow messaging yourself
    if (currentUserId === sellerId) {
      console.log('❌ User trying to message themselves')
      throw createError({
        statusCode: 400,
        message: 'You cannot message yourself'
      })
    }

// In start.post.ts, update the car lookup section:
console.log('🔍 Looking for car with ID:', carId)
console.log('🔍 Parsed carId:', parseInt(carId))

// Try with a direct query instead of findByPk
const car = await Car.findOne({
  where: { id: parseInt(carId) },
  raw: true
})

console.log('🔍 Car lookup result:', car ? `Found: ${car.make} ${car.model}` : 'Not found')

if (!car) {
  // Try a direct SQL query to see what's happening
  console.log('❌ Car not found with findByPk/One')
  console.log('❌ Checking database connection...')
  
  // Test the database connection
  try {
    const testQuery = await Car.findAll({
      attributes: ['id', 'make', 'model'],
      raw: true,
      limit: 5
    })
    console.log('✅ Database connection test - first 5 cars:', testQuery)
  } catch (dbError) {
    console.error('❌ Database error:', dbError)
  }
  
  throw createError({
    statusCode: 404,
    message: 'Car not found'
  })
}

    console.log('✅ Car found:', car.id, '-', car.make, car.model, car.year)

    // Find or create chat
    console.log('🔍 Looking for existing chat with:', {
      carId: parseInt(carId),
      sellerId: sellerId,
      buyerId: currentUserId
    })
    
    let chat = await Chat.findOne({
      where: {
        carId: parseInt(carId),
        sellerId: sellerId,
        buyerId: currentUserId
      },
      raw: true // ADD THIS LINE
    })

    if (chat) {
      console.log('✅ Existing chat found with ID:', chat.id)
      console.log('📅 Last message at:', chat.lastMessageAt)
    } else {
      console.log('🆕 Creating new chat...')
      
      try {
        // Create chat - use create method which returns the created instance
        const createdChat = await Chat.create({
          carId: parseInt(carId),
          sellerId: sellerId,
          buyerId: currentUserId,
          lastMessageAt: new Date()
        })
        
        // Get the plain object representation
        chat = createdChat.get({ plain: true })
        console.log('✅ New chat created successfully with ID:', chat.id)
      } catch (createError: any) {
        console.error('❌ Failed to create chat:', createError.message)
        console.error('❌ Error details:', createError)
        throw createError
      }
    }

    // Return response with chatId
    const response = {
      success: true,
      chatId: chat.id,
      message: chat ? 'Existing chat found' : 'Chat created successfully',
      chat: {
        id: chat.id,
        carId: chat.carId,
        sellerId: chat.sellerId,
        buyerId: chat.buyerId
      }
    }

    console.log('✅ Returning response:', response)
    return response

  } catch (error: any) {
    console.error('❌ Chat start error:', error)
    console.error('❌ Error stack:', error.stack)
    
    // If it's already a createError with statusCode, throw it as-is
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise wrap it in a createError
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to start chat'
    })
  }
})