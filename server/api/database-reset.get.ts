import { getDatabasePath } from '../utils/db-path'

export default defineEventHandler(async (event) => {
  const dbPath = getDatabasePath()
  
  return {
    message: 'Database reset endpoint',
    path: dbPath,
    exists: require('fs').existsSync(dbPath),
    usage: 'Send POST request to reset database'
  }
})