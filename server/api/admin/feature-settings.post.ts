// server/api/admin/feature-settings.post.ts
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
    
    const body = await readBody(event)
    
    // Update feature settings
    const configResult = FeatureService.updateFeatureConfig(body)
    
    return {
      success: true,
      message: 'Feature settings updated successfully',
      config: configResult
    }
    
  } catch (error: any) {
    console.error('❌ Error updating feature settings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})