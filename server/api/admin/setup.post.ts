// server/api/admin/setup.post.ts
import { createUser, getAllUsers } from '~/server/database/repositories/userRepository'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    // Check if any admin already exists
    const allUsers = await getAllUsers()
    const adminExists = allUsers.some(user => user.getDataValue('role') === 'admin')
    
    if (adminExists) {
      return {
        success: false,
        message: 'Admin user already exists. Please login instead.'
      }
    }
    
    // Get request body
    const body = await readBody(event)
    const { email, password, name } = body
    
    if (!email || !password || !name) {
      return {
        success: false,
        message: 'Email, password, and name are required'
      }
    }
    
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters'
      }
    }
    
    // Create admin user
    const adminUser = await createUser({
      email,
      password,
      name,
      role: 'admin',
      phone: '', // Optional
      verified: true,
      funds: 1000, // Give admin some starting funds
      verifiedBuyer: true
    })
    
    return {
      success: true,
      message: 'Admin account created successfully!',
      user: {
        id: adminUser.getDataValue('id'),
        email: adminUser.getDataValue('email'),
        name: adminUser.getDataValue('name'),
        role: adminUser.getDataValue('role')
      }
    }
    
  } catch (error: any) {
    console.error('Admin setup error:', error)
    
    // Check for duplicate email
    if (error.name === 'SequelizeUniqueConstraintError') {
      return {
        success: false,
        message: 'Email already registered'
      }
    }
    
    return {
      success: false,
      message: error.message || 'Failed to create admin account'
    }
  }
})