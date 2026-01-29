// server/utils/userAccess.ts - CREATE NEW FILE
/**
 * Safely get user data whether it's a Sequelize instance or plain object
 */
export function getUserData(user: any) {
  if (!user) return null
  
  // If it's a Sequelize instance
  if (typeof user.get === 'function') {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      // Add any other fields you need
      getDataValue: user.getDataValue?.bind(user)
    }
  }
  
  // If it's already a plain object
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    getDataValue: (key: string) => user[key]
  }
}

/**
 * Get specific field from user safely
 */
export function getUserField(user: any, field: string) {
  if (!user) return null
  
  if (typeof user.getDataValue === 'function') {
    // Sequelize instance
    return user.getDataValue(field)
  } else if (typeof user.get === 'function') {
    // Sequelize instance with get() method
    return user.get(field)
  } else {
    // Plain object
    return user[field]
  }
}