import { getDatabasePath } from '../utils/db-path'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const dbPath = getDatabasePath()
    
    // Check if database exists
    const dbExists = fs.existsSync(dbPath)
    
    if (dbExists) {
      // Backup the old database
      const backupPath = dbPath + '.backup-' + Date.now()
      fs.copyFileSync(dbPath, backupPath)
      console.log("Backup created at: " + backupPath)
      
      // Delete the database
      fs.unlinkSync(dbPath)
      console.log("Database deleted: " + dbPath)
      
      return {
        success: true,
        message: 'Database reset successfully',
        backup: backupPath,
        originalPath: dbPath
      }
    } else {
      return {
        success: true,
        message: 'Database does not exist, nothing to reset',
        path: dbPath
      }
    }
  } catch (error: any) {
    console.error('Database reset error:', error)
    return {
      success: false,
      message: 'Failed to reset database',
      error: error.message
    }
  }
})