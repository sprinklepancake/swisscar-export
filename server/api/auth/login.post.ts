// server/api/auth/login.post.ts - FIX THE LOGIN ENDPOINT
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '~/server/database/repositories/userRepository'
import jwt from 'jsonwebtoken'
import { getUserField } from '~/server/utils/userAccess'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  
  console.log('🔐 Login attempt for:', email)
  
  try {
    // Find user
    const user = await getUserByEmail(email)
    
    if (!user) {
      console.log('❌ User not found:', email)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      type: typeof user,
      hasGetDataValue: typeof user.getDataValue === 'function'
    })
    
    // SAFELY get the password field
    const userPassword = getUserField(user, 'password')
    
    if (!userPassword) {
      console.log('❌ No password found for user')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, userPassword)
    
    if (!validPassword) {
      console.log('❌ Invalid password for user:', email)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
    
    // Get user ID safely
    const userId = getUserField(user, 'id')
    const userEmail = getUserField(user, 'email')
    const userName = getUserField(user, 'name')
    const userRole = getUserField(user, 'role')
    
    if (!userId) {
      console.log('❌ No user ID found')
      throw createError({
        statusCode: 500,
        statusMessage: 'User data error'
      })
    }
    
    // Create JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId, email: userEmail, role: userRole },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    )
    
    // Create refresh token
    const refreshToken = jwt.sign(
      { userId },
      config.jwtRefreshSecret,
      { expiresIn: '7d' }
    )
    
    // Set cookies
    setCookie(event, 'access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 // 15 minutes
    })
    
    setCookie(event, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    // Return user info (without password)
    const userResponse = {
      id: userId,
      email: userEmail,
      name: userName,
      role: userRole
    }
    
    console.log('✅ Login successful for:', userEmail)
    
    return {
      success: true,
      user: userResponse
    }
    
  } catch (error: any) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Login failed'
    })
  }
})