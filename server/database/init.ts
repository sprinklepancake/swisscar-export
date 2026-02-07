// server/database/init.ts - REPLACE ENTIRE FILE
import { sequelize, testConnection } from './connection'
import { User } from './models/User'
import { Car } from './models/Car'
import { Bid } from './models/Bid'
import { Chat } from './models/Chat'
import { Message } from './models/Message'
import { ActivityLog } from './models/ActivityLog'
import { Watchlist } from './models/Watchlist'
import { TransactionLog } from './models/TransactionLog'
import { Settings } from './models/Settings'
import { AdminLog } from './models/AdminLog'

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
    ActivityLog.initialize(sequelize)
    Watchlist.initialize(sequelize)
    TransactionLog.initialize(sequelize)
    Settings.initialize(sequelize)
    AdminLog.initialize(sequelize)
    console.log('✅ All models initialized.')
    
    console.log('🔧 Step 3: Setting up associations...')
    // Create models object to pass to Chat.associate()
    const models = {
      User,
      Car,
      Bid,
      Chat,
      Message,
      ActivityLog,
      Watchlist,
      TransactionLog,
      Settings,
      AdminLog
    }
    
    // Call associate methods on each model
    User.associate?.()
    Car.associate?.()
    Bid.associate?.()
    Chat.associate(models)  // REQUIRES models parameter
    Message.associate?.()
    ActivityLog.associate?.()
    Watchlist.associate?.()
    TransactionLog.associate?.()
    AdminLog.associate?.()
    // Settings doesn't have associate method, so skip it
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