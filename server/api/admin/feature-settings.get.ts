// server/api/admin/feature-settings.get.ts
import jwt from 'jsonwebtoken'
import { FeatureService } from '~/server/services/featureService'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin access
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const config = useRuntimeConfig()
    
    if (!config.jwtAccessSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      })
    }
    
    let decodedToken: any = null
    
    try {
      decodedToken = jwt.verify(accessToken, config.jwtAccessSecret)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }
    
    // Check if user is admin
    if (decodedToken.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
    
    // Get current feature config
    const configResult = FeatureService.getFeatureConfig()
    
    return {
      success: true,
      config: configResult
    }
    
  } catch (error: any) {
    console.error('❌ Error getting feature settings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})