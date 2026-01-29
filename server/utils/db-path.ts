import path from 'path'
import fs from 'fs'

export function getDatabasePath(filename = 'database.sqlite') {
  // Render production
  if (process.env.RENDER) {
    const renderPath = '/opt/render/project/src/.data'
    
    // Ensure directory exists
    if (!fs.existsSync(renderPath)) {
      fs.mkdirSync(renderPath, { recursive: true })
    }
    
    return path.join(renderPath, filename)
  }
  
  // Local development
  return path.join(process.cwd(), filename)
}

export function getVehicleDatabasePath() {
  return getDatabasePath('vehicle_data.db')
}