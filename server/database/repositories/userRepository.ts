// server/database/repositories/userRepository.ts
import { User } from '../models/User'
import bcrypt from 'bcryptjs'
import { Op } from 'sequelize'

// ADD THIS FUNCTION
export const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      // Include all fields except password for security
      attributes: { 
        exclude: ['password', 'resetToken', 'resetTokenExpiry', 'verificationToken']
      }
    })
    
    return users // Returns array of User instances
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({
      where: { email },
      rejectOnEmpty: false
    })
    
    if (user) {
      // Return the Sequelize instance - don't convert to plain object
      return user
    }
    
    return null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export const getUserById = async (id: number) => {
  try {
    const user = await User.findByPk(id)
    return user // Returns Sequelize instance
  } catch (error) {
    console.error('Error getting user by id:', error)
    return null
  }
}

export const createUser = async (userData: {
  email: string
  password: string
  name: string
  phone: string
  role?: 'buyer' | 'seller' | 'admin'
  companyName?: string
  businessType?: 'private' | 'dealer' | 'business'
  canton?: string
  city?: string
  zipCode?: string
  country?: string
  taxId?: string
  streetAddress?: string // NEW FIELD
}) => {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(userData.password, salt)
    
    return await User.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      phone: userData.phone,
      role: userData.role || 'buyer',
      companyName: userData.companyName,
      businessType: userData.businessType,
      canton: userData.canton,
      city: userData.city,
      zipCode: userData.zipCode,
      country: userData.country,
      taxId: userData.taxId,
      streetAddress: userData.streetAddress // NEW FIELD
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const updateUser = async (id: number, updateData: any) => {
  try {
    const user = await User.findByPk(id)
    if (!user) return null
    
    return await user.update(updateData)
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export const getUserByResetToken = async (token: string) => {
  try {
    return await User.findOne({ 
      where: { 
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    })
  } catch (error) {
    console.error('Error getting user by reset token:', error)
    return null
  }
}

export const getUserByVerificationToken = async (token: string) => {
  try {
    return await User.findOne({ where: { verificationToken: token } })
  } catch (error) {
    console.error('Error getting user by verification token:', error)
    return null
  }
}

// Add these functions as well for complete admin functionality

export const getUsersWithFilters = async (filters: {
  role?: 'buyer' | 'seller' | 'admin'
  banned?: boolean
  verifiedBuyer?: boolean
  search?: string
}) => {
  try {
    const whereClause: any = {}
    
    if (filters.role) {
      whereClause.role = filters.role
    }
    
    if (filters.banned !== undefined) {
      whereClause.banned = filters.banned
    }
    
    if (filters.verifiedBuyer !== undefined) {
      whereClause.verifiedBuyer = filters.verifiedBuyer
    }
    
    if (filters.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
        { companyName: { [Op.iLike]: `%${filters.search}%` } }
      ]
    }
    
    const users = await User.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      attributes: { 
        exclude: ['password', 'resetToken', 'resetTokenExpiry', 'verificationToken']
      }
    })
    
    return users
  } catch (error) {
    console.error('Error getting filtered users:', error)
    return []
  }
}

export const countUsers = async () => {
  try {
    return await User.count()
  } catch (error) {
    console.error('Error counting users:', error)
    return 0
  }
}

export const getUsersByRole = async (role: 'buyer' | 'seller' | 'admin') => {
  try {
    return await User.findAll({
      where: { role },
      attributes: { 
        exclude: ['password', 'resetToken', 'resetTokenExpiry', 'verificationToken']
      }
    })
  } catch (error) {
    console.error('Error getting users by role:', error)
    return []
  }
}