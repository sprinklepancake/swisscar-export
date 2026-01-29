import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export function getDatabasePath() {
  // Render production
  if (process.env.RENDER) {
    const renderPath = '/opt/render/project/src/.data'
    if (!existsSync(renderPath)) {
      mkdirSync(renderPath, { recursive: true })
    }
    return join(renderPath, 'database.sqlite')
  }
  
  // Local development
  return join(process.cwd(), 'database.sqlite')
}
