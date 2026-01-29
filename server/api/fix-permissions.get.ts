// server/api/fix-permissions.get.ts
import { sequelize } from '~/server/database/connection'

export default defineEventHandler(async (event) => {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    
    // Check if file exists and get current permissions
    let stats;
    try {
      stats = await fs.stat(dbPath)
    } catch (e: any) {
      return {
        success: false,
        error: 'Database file not found',
        solution: 'The database file does not exist. It will be created automatically when needed.'
      }
    }
    
    // Get current permissions
    const mode = stats.mode
    const canWrite = !!(mode & 0o200) // Check if user has write permission
    
    if (!canWrite) {
      // Try to fix permissions
      try {
        await fs.chmod(dbPath, 0o666) // Read/write for everyone
        const newStats = await fs.stat(dbPath)
        const newCanWrite = !!(newStats.mode & 0o200)
        
        return {
          success: true,
          message: 'File permissions updated',
          originalPermissions: mode.toString(8),
          newPermissions: newStats.mode.toString(8),
          canWriteNow: newCanWrite,
          nextStep: 'Now visit /api/simple-reset to populate the database'
        }
      } catch (chmodError: any) {
        return {
          success: false,
          error: `Cannot change permissions: ${chmodError.message}`,
          solution: 'Stop the server, delete database.sqlite manually, then restart the server'
        }
      }
    } else {
      return {
        success: true,
        message: 'File already has write permissions',
        canWrite: true,
        nextStep: 'Visit /api/simple-reset to populate the database'
      }
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})