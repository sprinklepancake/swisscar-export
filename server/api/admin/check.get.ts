// server/api/admin/check.get.ts
import { getUserById } from '~/server/database/repositories/userRepository'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'access_token')
    
    if (!token) {
      return { isAdmin: false, authenticated: false }
    }
    
    const config = useRuntimeConfig()
    
    try {
      const decoded = jwt.verify(token, config.jwtAccessSecret) as any
      const user = await getUserById(decoded.userId)
      
      if (!user) {
        return { isAdmin: false, authenticated: false }
      }
      
      const userRole = user.getDataValue('role')
      const isAdmin = userRole === 'admin'
      
      if (isAdmin) {
        return {
          isAdmin: true,
          authenticated: true,
          user: {
            id: user.getDataValue('id'),
            email: user.getDataValue('email'),
            name: user.getDataValue('name'),
            role: userRole,
            funds: user.getDataValue('funds') || 0
          }
        }
      }
      
      return { 
        isAdmin: false, 
        authenticated: true,
        user: {
          id: user.getDataValue('id'),
          email: user.getDataValue('email'),
          name: user.getDataValue('name'),
          role: userRole
        }
      }
    } catch (error) {
      console.error('Token verification error:', error)
      return { isAdmin: false, authenticated: false }
    }
  } catch (error) {
    console.error('Admin check error:', error)
    return { isAdmin: false, authenticated: false }
  }
})