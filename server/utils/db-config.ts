import { join } from 'path'

export function getDatabasePath() {
  // Render disk mount path
  if (process.env.RENDER) {
    return join('/opt/render/project/src/.data', 'database.sqlite')
  }
  // Local development
  return join(process.cwd(), 'database.sqlite')
}
