// server/middleware/auth.ts
import jwt from 'jsonwebtoken'
import { getUserById } from '~/server/database/repositories/userRepository'

// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Skip auth for specific public routes ONLY
  const publicPaths = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/cars', // Make sure this is only for public car listings
    '/api/debug',
    '/'
  ]
  const path = getRequestURL(event).pathname
  
  // Only skip EXACT public paths, not their subpaths
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  )
  
  if (isPublicPath) {
    console.log('Auth middleware: Skipping public path', path)
    return
  }

  console.log('Auth middleware: Processing path', path)
  
  const token = getCookie(event, 'access_token')
  
  console.log('Auth middleware - Token present:', !!token)
  
  if (!token) {
    console.log('Auth middleware - No token found for path:', path)
    event.context.auth = null
    event.context.user = null
    
    // Only throw for protected routes
    const protectedPaths = ['/api/user', '/api/seller', '/dashboard', '/profile']
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      throw createError({
        statusCode: 401,
        message: 'Please login to access this resource'
      })
    }
    return
  }

  try {
    const config = useRuntimeConfig()
    console.log('Auth middleware - Verifying token...')
    
    const decoded = jwt.verify(token, config.jwtAccessSecret) as any
    console.log('Auth middleware - Decoded token user ID:', decoded.userId)
    
    const user = await getUserById(decoded.userId)
    
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.userId)
      throw new Error('User not found')
    }
    
    // ALWAYS use getDataValue for Sequelize instances
    const userData = {
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      name: user.getDataValue('name'),
      role: user.getDataValue('role'),
      funds: user.getDataValue('funds') || 0,
      banned: user.getDataValue('banned') || false,
      createdAt: user.getDataValue('createdAt')
    }
    
    console.log('Auth middleware - Processed user data:', userData)
    
    // Set both contexts explicitly
    event.context.auth = userData
    event.context.user = userData
    
    console.log('Auth middleware: User authenticated', userData.email, 'for path:', path)
  } catch (error) {
    console.error('Auth middleware error:', error)
    deleteCookie(event, 'access_token')
    event.context.auth = null
    event.context.user = null
    
    // Throw error for protected routes
    const protectedPaths = ['/api/user', '/api/seller', '/dashboard', '/profile']
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      throw createError({
        statusCode: 401,
        message: 'Please login to access this resource'
      })
    }
  }
})