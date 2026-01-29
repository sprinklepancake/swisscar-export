// server/database/models/index.ts - FIX TransactionLog associations
import { Sequelize } from 'sequelize'
import { User } from './User'
import { Car } from './Car'
import { Bid } from './Bid'
import { Chat } from './Chat'
import { Message } from './Message'
import { ActivityLog } from './ActivityLog'
import { Watchlist } from './Watchlist'
import { TransactionLog } from './TransactionLog'
import { Settings } from './Settings'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
  define: {
    timestamps: true
  }
})

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

// Set up associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Car, { foreignKey: 'sellerId', as: 'listings' })
  User.hasMany(Bid, { foreignKey: 'userId', as: 'bids' })
  User.hasMany(Chat, { foreignKey: 'buyerId', as: 'buyerChats' })
  User.hasMany(Chat, { foreignKey: 'sellerId', as: 'sellerChats' })
  User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' })
  User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' })
  User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlistItems' })
  User.hasMany(TransactionLog, { foreignKey: 'userId', as: 'transactions' })
  
  // Car associations
  Car.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })
  Car.hasMany(Bid, { foreignKey: 'carId', as: 'bids' })
  Car.hasMany(Chat, { foreignKey: 'carId', as: 'chats' })
  Car.hasMany(Watchlist, { foreignKey: 'carId', as: 'watchlistedBy' })
  
  // Bid associations
  Bid.belongsTo(User, { foreignKey: 'userId', as: 'bidder' })
  Bid.belongsTo(Car, { foreignKey: 'carId', as: 'car' })
  
  // Chat associations
  Chat.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' })
  Chat.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' })
  Chat.belongsTo(Car, { foreignKey: 'carId', as: 'car' })
  Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' })
  
  // Message associations
  Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' })
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })
  
  // ActivityLog associations
  ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'activityUser' })
  
  // Watchlist associations
  Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'watchlistUser' })
  Watchlist.belongsTo(Car, { foreignKey: 'carId', as: 'car' })
  
  // TransactionLog associations - FIXED
  TransactionLog.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  TransactionLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' }) // ADD THIS LINE
  
  // Settings doesn't need associations
}

setupAssociations()

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
  Settings,
  setupAssociations
}