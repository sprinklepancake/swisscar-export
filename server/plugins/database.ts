// server/plugins/database.ts
import { initDatabase } from '~/server/database/init'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('🔧 Database plugin: Starting initialization...')
  
  try {
    const success = await initDatabase()
    if (success) {
      console.log('✅ Database plugin: Initialization completed successfully')
    } else {
      console.error('❌ Database plugin: Initialization failed')
    }
  } catch (error) {
    console.error('❌ Database plugin: Error during initialization:', error)
  }
})