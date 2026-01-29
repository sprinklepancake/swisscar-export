// server/database/init.ts - REPLACE ENTIRE FILE
import { sequelize, testConnection } from './connection'
import { User } from './models/User'
import { Car } from './models/Car'
import { Bid } from './models/Bid'
import { Chat } from './models/Chat'
import { Message } from './models/Message'
import { setupAssociations } from './models'

export async function initDatabase() {
  try {
    console.log('🔧 Step 1: Testing database connection...')
    await testConnection()
    
    console.log('🔧 Step 2: Initializing models...')
    // Initialize models first
    User.initialize(sequelize)
    Car.initialize(sequelize)
    Bid.initialize(sequelize)
    Chat.initialize(sequelize)
    Message.initialize(sequelize)
    console.log('✅ All models initialized.')
    
    console.log('🔧 Step 3: Setting up associations...')
    // Then setup associations
    setupAssociations()
    
    // Call associate methods on each model
    User.associate()
    Car.associate()
    Bid.associate()
    Chat.associate()
    Message.associate()
    console.log('✅ Associations setup complete.')
    
    console.log('🔧 Step 4: Syncing database...')
    
    // Use alter: true to add missing columns without losing data
    await sequelize.sync({ alter: true })
    
    console.log('✅ Database synchronized')
    
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}