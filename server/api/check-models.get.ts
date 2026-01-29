// server/api/check-models.get.ts
import { sequelize } from '~/server/database/connection'
import { User, Car, Chat, Message } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Test database connection
    await sequelize.authenticate()
    
    // Check if tables exist
    const tables = await sequelize.getQueryInterface().showAllTables()
    
    // Try to count records in each table
    const userCount = await User.count().catch(e => `Error: ${e.message}`)
    const carCount = await Car.count().catch(e => `Error: ${e.message}`)
    const chatCount = await Chat.count().catch(e => `Error: ${e.message}`)
    const messageCount = await Message.count().catch(e => `Error: ${e.message}`)
    
    return {
      success: true,
      database: {
        connected: true,
        tables: tables
      },
      modelStatus: {
        User: userCount,
        Car: carCount,
        Chat: chatCount,
        Message: messageCount
      },
      instructions: 'Visit /api/database-reset to create test data'
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      instructions: 'Database connection failed. The database file might be corrupted.'
    }
  }
})