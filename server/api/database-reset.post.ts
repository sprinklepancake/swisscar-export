// server/api/database-reset.post.ts
import { sequelize } from '~/server/database/connection'
import { User, Car, Chat, Message } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔄 COMPLETELY RESETTING DATABASE...')
    
    // Completely drop and recreate the database file
    const fs = await import('fs/promises')
    const path = await import('path')
    
    // Delete the entire database file
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    try {
      await fs.unlink(dbPath)
      console.log('✅ Deleted database file')
    } catch (e) {
      console.log('ℹ️ No existing database file to delete')
    }
    
    // Reinitialize the database connection
    await sequelize.authenticate()
    console.log('✅ Database connection reestablished')
    
    // Sync all models with force: true to create tables
    await sequelize.sync({ force: true })
    console.log('✅ All tables created')
    
    // Create test users with proper hashed passwords
    // Using bcrypt hash for "password123"
    const hashedPassword = '$2a$10$8K1p/a0dRTlR7R2d7V8pEe6QZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ'
    
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
    
    console.log('✅ Test users created:', {
      seller: { id: seller.id, email: seller.email },
      buyer: { id: buyer.id, email: buyer.email }
    })
    
    // Create test car
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
    
    console.log('✅ Test car created:', { id: car.id, make: car.make, model: car.model })
    
    // Test chat creation
    const chat = await Chat.create({
      carId: car.id,
      sellerId: seller.id,
      buyerId: buyer.id,
      lastMessageAt: new Date()
    })
    
    console.log('✅ Test chat created:', { id: chat.id })
    
    // Test message creation
    const message = await Message.create({
      content: 'Hello, is this car still available?',
      senderId: buyer.id,
      chatId: chat.id,
      read: false
    })
    
    console.log('✅ Test message created:', { id: message.id })
    
    return {
      success: true,
      message: 'Database completely reset with test data!',
      testData: {
        users: {
          seller: { id: seller.id, email: seller.email, password: 'password123' },
          buyer: { id: buyer.id, email: buyer.email, password: 'password123' }
        },
        car: { id: car.id, title: `${car.make} ${car.model}` },
        chat: { id: chat.id },
        message: { id: message.id }
      }
    }
    
  } catch (error: any) {
    console.error('❌ RESET FAILED:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})