// server/middleware/admin.auth.ts
import { getUserById } from '~/server/database/repositories/userRepository'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // Only protect admin API routes
  const path = event.path
  
  // Check if this is an admin API route (excluding setup)
  if (path?.startsWith('/api/admin/') && !path.includes('/api/admin/setup')) {
    const token = getCookie(event, 'access_token')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }
    
    try {
      const config = useRuntimeConfig()
      const decoded = jwt.verify(token, config.jwtAccessSecret) as any
      
      const user = await getUserById(decoded.userId)
      
      if (!user) {
        throw createError({
          statusCode: 401,
          message: 'User not found'
        })
      }
      
      // Check if user is admin
      const userRole = user.getDataValue('role')
      if (userRole !== 'admin') {
        throw createError({
          statusCode: 403,
          message: 'Admin access required'
        })
      }
      
      // Set admin user in context
      event.context.adminUser = {
        id: user.getDataValue('id'),
        email: user.getDataValue('email'),
        name: user.getDataValue('name'),
        role: userRole
      }
      
    } catch (error: any) {
      console.error('Admin auth error:', error)
      throw createError({
        statusCode: 401,
        message: error.message || 'Invalid or expired token'
      })
    }
  }
})