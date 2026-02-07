import { getDatabasePath } from '../utils/db-path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const dbPath = getDatabasePath()
    const dbExists = fs.existsSync(dbPath)
    
    if (!dbExists) {
      return {
        success: false,
        message: 'Database file does not exist',
        path: dbPath,
        solution: 'The database will be created automatically when the server starts'
      }
    }
    
    // Try to read the file
    try {
      fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK)
      return {
        success: true,
        message: 'Database permissions are correct',
        path: dbPath
      }
    } catch (accessError: any) {
      // Try to fix permissions
      try {
        fs.chmodSync(dbPath, 0o666)
        return {
          success: true,
          message: 'Database permissions fixed',
          path: dbPath,
          previousError: accessError.message
        }
      } catch (chmodError: any) {
        return {
          success: false,
          message: 'Cannot fix database permissions',
          path: dbPath,
          error: chmodError.message,
          solution: 'Stop the server, delete database manually, then restart the server'
        }
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Error checking database permissions',
      error: error.message
    }
  }
})