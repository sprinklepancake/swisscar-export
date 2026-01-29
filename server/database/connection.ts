// server/database/connection.ts
import { Sequelize } from 'sequelize'
import path from 'path'
import fs from 'fs'

// Use absolute path to the database in current directory
const dbPath = path.resolve(process.cwd(), 'database.sqlite')

console.log('🔧 Database Configuration:')
console.log('   Current directory:', process.cwd())
console.log('   Database path:', dbPath)
console.log('   File exists:', fs.existsSync(dbPath))

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: (sql) => console.log('📊 SQL:', sql), // Enable to see all queries
  define: {
    timestamps: true
  }
})

export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Connected to database at:', sequelize.config.storage)
    
    // Test query
    const [result] = await sequelize.query('SELECT COUNT(*) as count FROM cars')
    console.log(`📊 Database has ${(result[0] as any).count} car(s)`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}