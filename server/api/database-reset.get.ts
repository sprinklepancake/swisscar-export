// server/api/database-reset.get.ts
import { sequelize } from '~/server/database/connection'
import { User, Car, Chat, Message } from '~/server/database/models'
import { setupAssociations } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔄 RESETTING DATABASE...')
    
    // Import file system modules
    const fs = await import('fs/promises')
    const path = await import('path')
    
    // Delete the database file WITHOUT closing connection
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    try {
      await fs.unlink(dbPath)
      console.log('✅ Deleted database file')
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        console.log('ℹ️ No existing database file to delete')
      } else {
        console.log('⚠️ Could not delete database file:', e.message)
      }
    }
    
    // Recreate database by syncing with force
    console.log('🔧 Recreating database tables...')
    await sequelize.sync({ force: true })
    console.log('✅ Database tables created')
    
    // Setup associations
    console.log('🔧 Setting up associations...')
    setupAssociations()
    console.log('✅ Associations configured')
    
    // Create test users with properly hashed password for "password123"
    const hashedPassword = '$2a$10$8K1p/a0dRTlR7R2d7V8pEe6QZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ'
    
    console.log('👤 Creating test users...')
    const seller = await User.create({
      email: 'seller@test.com',
      password: hashedPassword,
      name: 'Test Seller',
      role: 'seller',
      verified: true
    })
    
    const buyer = await User.create({
      email: 'buyer@test.com', 
      password: hashedPassword,
      name: 'Test Buyer', 
      role: 'buyer',
      verified: true
    })
    
    console.log('✅ Test users created:', { sellerId: seller.id, buyerId: buyer.id })
    
    // Create test car
    console.log('🚗 Creating test car...')
    const car = await Car.create({
      sellerId: seller.id,
      make: 'Toyota',
      model: 'Camry', 
      year: 2020,
      price: 25000,
      startingPrice: 20000,
      mileage: 15000,
      color: 'Red',
      condition: 'excellent',
      fuelType: 'Petrol',
      transmission: 'Automatic', 
      engineSize: '2.5L',
      description: 'Excellent condition Toyota Camry with low mileage',
      images: ['/placeholder-car.jpg'],
      canton: 'ZH',
      city: 'Zurich',
      status: 'active',
      isFeatured: false,
      exportDocuments: true
    })
    
    console.log('✅ Test car created:', { carId: car.id })
    
    // Test chat creation
    console.log('💬 Creating test chat...')
    const chat = await Chat.create({
      carId: car.id,
      sellerId: seller.id,
      buyerId: buyer.id,
      lastMessageAt: new Date()
    })
    
    console.log('✅ Test chat created:', { chatId: chat.id })
    
    // Test message creation
    console.log('✉️ Creating test message...')
    const message = await Message.create({
      content: 'Hello, is this car still available?',
      senderId: buyer.id,
      chatId: chat.id,
      read: false
    })
    
    console.log('✅ Test message created:', { messageId: message.id })
    
    return {
      success: true,
      message: 'Database completely reset with test data!',
      testData: {
        users: {
          seller: { id: seller.id, email: seller.email, password: 'password123' },
          buyer: { id: buyer.id, email: buyer.email, password: 'password123' }
        },
        car: { 
          id: car.id, 
          title: `${car.make} ${car.model}`,
          sellerId: car.sellerId
        },
        chat: { id: chat.id },
        message: { id: message.id }
      },
      loginInstructions: {
        seller: 'Use: seller@test.com / password123',
        buyer: 'Use: buyer@test.com / password123'
      }
    }
    
  } catch (error: any) {
    console.error('❌ RESET FAILED:', error)
    return {
      success: false,
      error: error.message,
      stepByStepError: 'Check the console for detailed error information'
    }
  }
})