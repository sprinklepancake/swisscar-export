// server/api/test-chat.get.ts
import { Chat, Message, User, Car } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Test if database has data
    const userCount = await User.count()
    const carCount = await Car.count() 
    const chatCount = await Chat.count()
    const messageCount = await Message.count()
    
    // Try to create a test chat
    const testUser = await User.findOne()
    const testCar = await Car.findOne()
    
    let testResult = 'No users or cars available for testing'
    
    if (testUser && testCar) {
      const testChat = await Chat.create({
        carId: testCar.id,
        sellerId: testCar.sellerId,
        buyerId: testUser.id,
        lastMessageAt: new Date()
      })
      
      const testMessage = await Message.create({
        content: 'Test message from API',
        senderId: testUser.id, 
        chatId: testChat.id,
        read: false
      })
      
      testResult = `✅ Chat test passed! Created chat ${testChat.id} and message ${testMessage.id}`
    }
    
    return {
      success: true,
      counts: {
        users: userCount,
        cars: carCount,
        chats: chatCount,
        messages: messageCount
      },
      testResult,
      availableData: {
        user: testUser ? { id: testUser.id, email: testUser.email } : null,
        car: testCar ? { id: testCar.id, make: testCar.make, model: testCar.model } : null
      }
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      details: error.toString()
    }
  }
})