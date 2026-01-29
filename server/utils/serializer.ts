// server/utils/serializer.ts

/**
 * Convert any object to a plain JSON-serializable object
 */
export function toPlainObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => toPlainObject(item))
  }
  
  if (typeof obj === 'object') {
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString()
    }
    
    // Handle Sequelize models and other complex objects
    const plainObj: any = {}
    for (const key in obj) {
      // Skip methods and private properties
      if (typeof obj[key] === 'function' || key.startsWith('_')) {
        continue
      }
      
      // Recursively convert nested objects
      plainObj[key] = toPlainObject(obj[key])
    }
    return plainObj
  }
  
  // Return primitive values as-is
  return obj
}