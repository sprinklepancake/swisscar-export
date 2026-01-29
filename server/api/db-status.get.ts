// server/api/db-status.get.ts
import { sequelize } from '~/server/database/connection'

export default defineEventHandler(async (event) => {
  try {
    // Test connection
    await sequelize.authenticate()
    
    // Get table info
    const tables = await sequelize.getQueryInterface().showAllTables()
    
    // Get row counts
    const userCount = await sequelize.query('SELECT COUNT(*) as count FROM users', { 
      type: 'SELECT' 
    }) as any
    
    const carCount = await sequelize.query('SELECT COUNT(*) as count FROM cars', { 
      type: 'SELECT' 
    }) as any
    
    const chatCount = await sequelize.query('SELECT COUNT(*) as count FROM chats', { 
      type: 'SELECT' 
    }) as any
    
    const messageCount = await sequelize.query('SELECT COUNT(*) as count FROM messages', { 
      type: 'SELECT' 
    }) as any
    
    return {
      success: true,
      database: 'Connected ✅',
      tables: tables,
      counts: {
        users: userCount[0]?.count || 0,
        cars: carCount[0]?.count || 0,
        chats: chatCount[0]?.count || 0,
        messages: messageCount[0]?.count || 0
      },
      nextStep: tables.length > 0 
        ? 'Visit /api/database-reset to add test data' 
        : 'Visit /api/database-reset to create database'
    }
    
  } catch (error: any) {
    return {
      success: false,
      database: 'Not Connected ❌',
      error: error.message,
      solution: 'The database file might be corrupted. Visit /api/database-reset to recreate it.'
    }
  }
})