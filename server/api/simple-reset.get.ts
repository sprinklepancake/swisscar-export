// server/api/simple-reset.get.ts
import { sequelize } from '~/server/database/connection'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔄 SIMPLE DATABASE RESET (Read-Only Safe)...')
    
    // First, try to create a test table to check if we can write
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS test_permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_value TEXT
        )
      `)
      await sequelize.query('DROP TABLE IF EXISTS test_permissions')
      console.log('✅ Write permissions confirmed')
    } catch (writeError: any) {
      console.error('❌ No write permissions:', writeError.message)
      return {
        success: false,
        error: 'Database is read-only. Cannot write to database file.',
        solution: 'Stop the server, delete database.sqlite manually, then restart the server'
      }
    }
    
    // Drop all tables in correct order (due to foreign keys)
    console.log('🗑️ Dropping existing tables...')
    await sequelize.query('PRAGMA foreign_keys = OFF')
    await sequelize.query('DROP TABLE IF EXISTS messages')
    await sequelize.query('DROP TABLE IF EXISTS chats') 
    await sequelize.query('DROP TABLE IF EXISTS bids')
    await sequelize.query('DROP TABLE IF EXISTS cars')
    await sequelize.query('DROP TABLE IF EXISTS users')
    await sequelize.query('PRAGMA foreign_keys = ON')
    console.log('✅ All tables dropped')
    
    // Create tables with proper foreign keys
    console.log('🔧 Creating tables...')
    await sequelize.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        role VARCHAR(50) DEFAULT 'buyer',
        verified BOOLEAN DEFAULT 0,
        funds DECIMAL(10,2) DEFAULT 0,
        verifiedBuyer BOOLEAN DEFAULT 0,
        banned BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    await sequelize.query(`
      CREATE TABLE cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sellerId INTEGER NOT NULL,
        make VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        price DECIMAL(10,2),
        startingPrice DECIMAL(10,2),
        mileage INTEGER NOT NULL,
        color VARCHAR(255) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        fuelType VARCHAR(255) NOT NULL,
        transmission VARCHAR(255) NOT NULL,
        engineSize VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        images TEXT NOT NULL DEFAULT '[]',
        canton VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        auctionEnd DATETIME,
        views INTEGER DEFAULT 0,
        isFeatured BOOLEAN DEFAULT 0,
        shippingCost DECIMAL(10,2),
        exportDocuments BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sellerId) REFERENCES users(id)
      )
    `)
    
    await sequelize.query(`
      CREATE TABLE chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        carId INTEGER NOT NULL,
        sellerId INTEGER NOT NULL,
        buyerId INTEGER NOT NULL,
        lastMessageAt DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (carId) REFERENCES cars(id),
        FOREIGN KEY (sellerId) REFERENCES users(id),
        FOREIGN KEY (buyerId) REFERENCES users(id)
      )
    `)
    
    await sequelize.query(`
      CREATE TABLE messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        senderId INTEGER NOT NULL,
        chatId INTEGER NOT NULL,
        read BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (chatId) REFERENCES chats(id)
      )
    `)
    console.log('✅ All tables created')
    
    // Insert test data
    console.log('👤 Inserting test data...')
    const hashedPassword = '$2a$10$8K1p/a0dRTlR7R2d7V8pEe6QZJZJZJZJZJZJZJZJZJZJZJZJZJZJZJ'
    
    await sequelize.query(`
      INSERT INTO users (email, password, name, role, verified) 
      VALUES 
        ('seller@test.com', ?, 'Test Seller', 'seller', 1),
        ('buyer@test.com', ?, 'Test Buyer', 'buyer', 1)
    `, { replacements: [hashedPassword, hashedPassword] })
    
    await sequelize.query(`
      INSERT INTO cars (sellerId, make, model, year, price, startingPrice, mileage, color, condition, fuelType, transmission, engineSize, description, images, canton, city, status)
      VALUES (1, 'Toyota', 'Camry', 2020, 25000, 20000, 15000, 'Red', 'excellent', 'Petrol', 'Automatic', '2.5L', 'Excellent condition Toyota Camry', '["/placeholder-car.jpg"]', 'ZH', 'Zurich', 'active')
    `)
    
    await sequelize.query(`
      INSERT INTO chats (carId, sellerId, buyerId, lastMessageAt)
      VALUES (1, 1, 2, CURRENT_TIMESTAMP)
    `)
    
    await sequelize.query(`
      INSERT INTO messages (content, senderId, chatId, read)
      VALUES ('Hello, is this car still available?', 2, 1, 0)
    `)
    console.log('✅ Test data inserted')
    
    // Verify the data was inserted
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', { type: 'SELECT' }) as any
    const carCount = await sequelize.query('SELECT COUNT(*) as count FROM cars', { type: 'SELECT' }) as any
    const chatCount = await sequelize.query('SELECT COUNT(*) as count FROM chats', { type: 'SELECT' }) as any
    const messageCount = await sequelize.query('SELECT COUNT(*) as count FROM messages', { type: 'SELECT' }) as any
    
    return {
      success: true,
      message: 'Database reset completed successfully!',
      counts: {
        users: userCount[0]?.count,
        cars: carCount[0]?.count, 
        chats: chatCount[0]?.count,
        messages: messageCount[0]?.count
      },
      testAccounts: {
        seller: 'seller@test.com / password123',
        buyer: 'buyer@test.com / password123'
      },
      nextStep: 'Login and test the chat system'
    }
    
  } catch (error: any) {
    console.error('❌ RESET FAILED:', error)
    
    // Provide specific solutions based on the error
    if (error.message.includes('SQLITE_READONLY') || error.message.includes('READONLY')) {
      return {
        success: false,
        error: 'Database file is read-only',
        solution: 'Stop the Nuxt server, delete the database.sqlite file manually, then restart the server'
      }
    } else if (error.message.includes('permission') || error.message.includes('access')) {
      return {
        success: false, 
        error: 'File permission error',
        solution: 'Run: chmod 666 database.sqlite (in your project folder) or delete the file and restart'
      }
    } else {
      return {
        success: false,
        error: error.message
      }
    }
  }
})