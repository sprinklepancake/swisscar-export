import { getDatabasePath } from '~/utils/db-path'

export default defineEventHandler(async (event) => {
  const dbPath = getDatabasePath()
  
  return {
    message: 'Simple reset endpoint',
    path: dbPath,
    instructions: [
      '1. Stop the Nuxt server',
      '2. Delete the file: ' + dbPath,
      '3. Restart the server',
      '4. The database will be recreated automatically'
    ]
  }
})