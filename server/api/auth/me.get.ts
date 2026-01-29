// server/api/auth/me.get.ts
import jwt from 'jsonwebtoken'
import { getUserById } from '../../database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    const accessToken = getCookie(event, 'access_token')
    
    console.log('Auth me - Token present:', !!accessToken)
    
    if (!accessToken) {
      console.log('Auth me - No token found')
      return { user: null }
    }

    const config = useRuntimeConfig()
    
    // Verify token
    const decoded = jwt.verify(accessToken, config.jwtAccessSecret) as any
    console.log('Auth me - Decoded token:', decoded)
    
    const userId = decoded.userId || decoded.id
    console.log('Auth me - Extracted user ID:', userId)
    
    if (!userId) {
      console.log('Auth me - No user ID in token')
      deleteCookie(event, 'access_token')
      deleteCookie(event, 'refresh_token')
      return { user: null }
    }

    // Get user from database
    const user = await getUserById(userId)
    console.log('Auth me - User instance type:', typeof user)
    console.log('Auth me - Is Sequelize instance:', user && typeof user.getDataValue === 'function')
    
    if (!user) {
      console.log('Auth me - User not found in database for ID:', userId)
      deleteCookie(event, 'access_token')
      deleteCookie(event, 'refresh_token')
      return { user: null }
    }
    
    // RETURN ALL USER DATA INCLUDING VERIFIED STATUS
    const userResponse = {
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      name: user.getDataValue('name'),
      role: user.getDataValue('role'),
      phone: user.getDataValue('phone'),
      funds: user.getDataValue('funds') || 0,
      verified: user.getDataValue('verified') || false, // MAKE SURE THIS IS INCLUDED
      verifiedBuyer: user.getDataValue('verifiedBuyer') || false,
      banned: user.getDataValue('banned') || false,
      createdAt: user.getDataValue('createdAt'),
      
      // Fields for car listing pre-filling
      companyName: user.getDataValue('companyName') || '',
      businessType: user.getDataValue('businessType') || '',
      canton: user.getDataValue('canton') || '',
      city: user.getDataValue('city') || '',
      zipCode: user.getDataValue('zipCode') || '',
      country: user.getDataValue('country') || 'Switzerland',
      taxId: user.getDataValue('taxId') || '',
      streetAddress: user.getDataValue('streetAddress') || '',
      
      // Profile info
      profileImage: user.getDataValue('profileImage') || '',
      description: user.getDataValue('description') || ''
    }

    console.log('Auth me - User verification status:', {
      email: userResponse.email,
      name: userResponse.name,
      verified: userResponse.verified,
      verifiedBuyer: userResponse.verifiedBuyer,
      role: userResponse.role
    })
    
    return { 
      user: userResponse
    }
  } catch (error) {
    console.error('Auth me - Token verification error:', error)
    // Clear invalid tokens
    deleteCookie(event, 'access_token')
    deleteCookie(event, 'refresh_token')
    
    return { user: null }
  }
})