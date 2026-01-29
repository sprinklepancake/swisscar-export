// server/database/models/index.ts - FIX TransactionLog associations
import { sequelize } from '../connection'  // Use the shared connection
import { User } from './User'
import { Car } from './Car'
import { Bid } from './Bid'
import { Chat } from './Chat'
import { Message } from './Message'
import { ActivityLog } from './ActivityLog'
import { Watchlist } from './Watchlist'
import { TransactionLog } from './TransactionLog'
import { Settings } from './Settings'

console.log('📦 Initializing models with database at:', sequelize.config.storage)

// Initialize all models
User.initialize(sequelize)
Car.initialize(sequelize)
Bid.initialize(sequelize)
Chat.initialize(sequelize)
Message.initialize(sequelize)
ActivityLog.initialize(sequelize)
Watchlist.initialize(sequelize)
TransactionLog.initialize(sequelize)
Settings.initialize(sequelize)

// Export models
export {
  sequelize,
  User,
  Car,
  Bid,
  Chat,
  Message,
  ActivityLog,
  Watchlist,
  TransactionLog,
  Settings
}