// server/utils/auth.ts - UPDATE THE USER DATA EXTRACTION
import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { getUserById } from '~/server/database/repositories/userRepository'
import { getUserName, extractUserEmail } from '~/server/utils/userHelpers' // ADD THIS

export async function requireAuth(event: H3Event) {
  try {
    console.log('🔐 requireAuth called')
    
    // First check if user is already in context (from middleware)
    if (event.context.user) {
      console.log('🔐 Using user from context:', event.context.user.id)
      return event.context.user
    }
    
    // Otherwise verify token directly
    const token = getCookie(event, 'access_token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    console.log('🔐 Token present:', !!token)
    
    if (!token) {
      console.log('❌ No token found')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const config = useRuntimeConfig()
    console.log('🔐 JWT secret configured:', !!config.jwtAccessSecret)
    
    if (!config.jwtAccessSecret) {
      console.log('❌ JWT secret not configured')
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      })
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtAccessSecret) as any
    console.log('🔐 Decoded token:', decoded)
    
    const userId = decoded.userId || decoded.id
    console.log('🔐 User ID from token:', userId)
    
    if (!userId) {
      console.log('❌ No user ID in token')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get user from database
    const user = await getUserById(userId)
    console.log('🔐 User found in DB:', user)
    console.log('🔐 User type:', typeof user)
    console.log('🔐 Is Sequelize instance?', user && typeof user.get === 'function')
    
    if (!user) {
      console.log('❌ User not found in database')
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }
    
    // CRITICAL: Extract data properly using our helpers
    const userName = getUserName(user)
    const userEmail = extractUserEmail(user)
    
    console.log('🔐 Extracted from user:', {
      id: user.id,
      name: userName,
      email: userEmail,
      hasName: !!userName && userName !== 'User'
    })
    
    const userData = {
      id: user.id,
      email: userEmail,
      name: userName, // Use the helper to get name
      role: user.role,
      // Extract other fields safely
      ...(user.profileImage && { profileImage: user.profileImage }),
      ...(user.createdAt && { createdAt: user.createdAt }),
      ...(user.verified !== undefined && { verified: user.verified }),
      ...(user.phone && { phone: user.phone })
    }
    
    console.log('🔐 Final user data to return:', userData)
    
    return userData
    
  } catch (error: any) {
    console.error('🔐 Auth error details:', error.message)
    
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      })
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed: ' + error.message
    })
  }
}