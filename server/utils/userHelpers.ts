// server/utils/userHelpers.ts - COMPLETE VERSION
export function extractUserData(user: any) {
  if (!user) return null
  
  // Handle both plain objects and Sequelize instances
  const userData = {
    id: extractUserId(user),
    name: getUserName(user),
    email: extractUserEmail(user),
    role: user.role || user.dataValues?.role,
    // Add all fields we might need
    ...(user.profileImage || user.dataValues?.profileImage ? { profileImage: user.profileImage || user.dataValues?.profileImage } : {}),
    ...(user.phone || user.dataValues?.phone ? { phone: user.phone || user.dataValues?.phone } : {}),
    ...(user.verified !== undefined || user.dataValues?.verified !== undefined ? { verified: user.verified !== undefined ? user.verified : user.dataValues?.verified } : {}),
    ...(user.createdAt || user.dataValues?.createdAt ? { createdAt: user.createdAt || user.dataValues?.createdAt } : {}),
    ...(user.updatedAt || user.dataValues?.updatedAt ? { updatedAt: user.updatedAt || user.dataValues?.updatedAt } : {})
  }
  
  return userData
}

export function extractUserId(user: any): number | null {
  if (!user) return null
  
  // Check for Sequelize instance
  if (typeof user.get === 'function') {
    return user.id || null
  }
  
  // Check for plain object
  if (user.id) {
    return user.id
  }
  
  // Check for userId
  if (user.userId) {
    return user.userId
  }
  
  // Try to get from dataValues
  if (user.dataValues && user.dataValues.id) {
    return user.dataValues.id
  }
  
  return null
}

export function extractUserEmail(user: any): string | null {
  if (!user) return null
  
  if (typeof user.get === 'function') {
    return user.email || null
  }
  
  return user.email || null
}

// Helper to get user name safely - CRITICAL FUNCTION
export function getUserName(user: any): string {
  if (!user) return 'User'
  
  console.log('🔍 getUserName called with:', {
    userType: typeof user,
    userKeys: Object.keys(user || {}),
    user: user
  })
  
  // Try different ways to get the name
  if (typeof user === 'object') {
    // First check: direct property
    if (user.name && typeof user.name === 'string' && user.name.trim()) {
      console.log('✅ Found name in user.name:', user.name)
      return user.name
    }
    
    // Second check: Sequelize getter method
    if (typeof user.get === 'function') {
      try {
        const name = user.get('name')
        if (name && typeof name === 'string' && name.trim()) {
          console.log('✅ Found name via user.get("name"):', name)
          return name
        }
      } catch (error) {
        console.log('❌ Error getting name via user.get:', error)
      }
    }
    
    // Third check: dataValues
    if (user.dataValues && user.dataValues.name && typeof user.dataValues.name === 'string' && user.dataValues.name.trim()) {
      console.log('✅ Found name in user.dataValues.name:', user.dataValues.name)
      return user.dataValues.name
    }
    
    // Fourth check: toJSON method
    if (typeof user.toJSON === 'function') {
      try {
        const json = user.toJSON()
        if (json.name && typeof json.name === 'string' && json.name.trim()) {
          console.log('✅ Found name via user.toJSON().name:', json.name)
          return json.name
        }
      } catch (error) {
        console.log('❌ Error getting name via toJSON:', error)
      }
    }
    
    // Fifth check: getDataValue method (Sequelize specific)
    if (typeof user.getDataValue === 'function') {
      try {
        const name = user.getDataValue('name')
        if (name && typeof name === 'string' && name.trim()) {
          console.log('✅ Found name via user.getDataValue("name"):', name)
          return name
        }
      } catch (error) {
        console.log('❌ Error getting name via getDataValue:', error)
      }
    }
  }
  
  console.log('❌ No valid name found, returning "User" as fallback')
  return 'User'
}

// Helper to check if we have a valid user object
export function isValidUser(user: any): boolean {
  if (!user) return false
  
  // Check if it has basic user properties
  const hasId = extractUserId(user) !== null
  const hasName = getUserName(user) !== 'User'
  const hasEmail = extractUserEmail(user) !== null
  
  return hasId && (hasName || hasEmail)
}
