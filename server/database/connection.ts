// server/database/connection.ts
import { Sequelize } from 'sequelize'
import path from 'path'
import fs from 'fs'

// Get the correct database path for environment
function getDatabasePath() {
  // Render production
  if (process.env.RENDER) {
    const renderPath = '/opt/render/project/src/.data'
    console.log('🚀 Render environment detected')
    console.log('   Render path:', renderPath)
    
    // Ensure directory exists
    if (!fs.existsSync(renderPath)) {
      console.log('   Creating directory:', renderPath)
      fs.mkdirSync(renderPath, { recursive: true })
    }
    
    const dbPath = path.join(renderPath, 'database.sqlite')
    console.log('   Database will be at:', dbPath)
    return dbPath
  }
  
  // Local development
  const dbPath = path.resolve(process.cwd(), 'database.sqlite')
  console.log('💻 Local development environment')
  console.log('   Database path:', dbPath)
  return dbPath
}

const dbPath = getDatabasePath()

console.log('🔧 Database Configuration:')
console.log('   Environment:', process.env.NODE_ENV || 'development')
console.log('   Database path:', dbPath)
console.log('   File exists:', fs.existsSync(dbPath))

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: (sql) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 SQL:', sql)
    }
  },
  define: {
    timestamps: true
  }
})

export async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Connected to database at:', sequelize.config.storage)
    
    // Test query (won't fail if tables don't exist yet)
    try {
      const [result] = await sequelize.query('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"')
      const tableCount = (result[0] as any).count
      console.log(`📊 Database has ${tableCount} table(s)`)
    } catch (queryError) {
      console.log('📊 Database is empty or tables not created yet')
    }
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}