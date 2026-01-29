// server/api/admin/users.get.ts - Update to include 'verified' field
import { getAllUsers } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    const users = await getAllUsers()
    
    // Convert to plain objects and exclude sensitive data
    const safeUsers = users.map(user => ({
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      name: user.getDataValue('name'),
      phone: user.getDataValue('phone'),
      role: user.getDataValue('role'),
      verified: user.getDataValue('verified'), // ADDED
      verifiedBuyer: user.getDataValue('verifiedBuyer'),
      banned: user.getDataValue('banned'),
      funds: parseFloat(user.getDataValue('funds') || 0),
      companyName: user.getDataValue('companyName'),
      businessType: user.getDataValue('businessType'),
      canton: user.getDataValue('canton'),
      city: user.getDataValue('city'),
      zipCode: user.getDataValue('zipCode'),
      country: user.getDataValue('country'),
      profileImage: user.getDataValue('profileImage'),
      language: user.getDataValue('language'),
      currency: user.getDataValue('currency'),
      lastLogin: user.getDataValue('lastLogin'),
      loginCount: user.getDataValue('loginCount'),
      createdAt: user.getDataValue('createdAt'),
      updatedAt: user.getDataValue('updatedAt')
    }))
    
    return {
      success: true,
      users: safeUsers
    }
  } catch (error) {
    console.error('Error getting users:', error)
    return {
      success: false,
      error: 'Failed to fetch users'
    }
  }
})