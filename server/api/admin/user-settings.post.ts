// server/api/admin/user-settings.post.ts
import jwt from 'jsonwebtoken'
import { Settings } from '~/server/database/models'

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
    const {
      requireIdVerification,
      freeFirstSixMonths,
      autoExpireFeatures,
      emailNotifications
    } = body
    
    // Validate all settings are provided
    if (
      requireIdVerification === undefined ||
      freeFirstSixMonths === undefined ||
      autoExpireFeatures === undefined ||
      emailNotifications === undefined
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All user settings are required'
      })
    }
    
    // Save settings using Settings model
    await Settings.setSetting('requireIdVerification', Boolean(requireIdVerification), {
      description: 'Require ID verification for bidding/selling',
      category: 'user',
      dataType: 'boolean',
      updatedBy: decodedToken.userId
    })
    
    await Settings.setSetting('freeFirstSixMonths', Boolean(freeFirstSixMonths), {
      description: 'New sellers get free listings for first 6 months',
      category: 'user',
      dataType: 'boolean',
      updatedBy: decodedToken.userId
    })
    
    await Settings.setSetting('autoExpireFeatures', Boolean(autoExpireFeatures), {
      description: 'Auto-expire featured listings after duration',
      category: 'features',
      dataType: 'boolean',
      updatedBy: decodedToken.userId
    })
    
    await Settings.setSetting('emailNotifications', Boolean(emailNotifications), {
      description: 'Send email notifications for important actions',
      category: 'notifications',
      dataType: 'boolean',
      updatedBy: decodedToken.userId
    })
    
    // Log the action
    console.log('📝 User settings updated:', {
      requireIdVerification: Boolean(requireIdVerification),
      freeFirstSixMonths: Boolean(freeFirstSixMonths),
      autoExpireFeatures: Boolean(autoExpireFeatures),
      emailNotifications: Boolean(emailNotifications),
      adminId: decodedToken.userId,
      timestamp: new Date().toISOString()
    })
    
    // If autoExpireFeatures is disabled, disable the cron job
    if (!Boolean(autoExpireFeatures)) {
      console.log('⏰ Auto-expire features disabled. Featured listings will not expire automatically.')
    }
    
    // If requireIdVerification is changed, log it for auditing
    if (Boolean(requireIdVerification)) {
      console.log('🔐 ID verification is now REQUIRED for bidding/selling')
    } else {
      console.log('⚠️ ID verification is now OPTIONAL for bidding/selling')
    }
    
    return {
      success: true,
      message: 'User settings updated successfully',
      settings: {
        requireIdVerification: Boolean(requireIdVerification),
        freeFirstSixMonths: Boolean(freeFirstSixMonths),
        autoExpireFeatures: Boolean(autoExpireFeatures),
        emailNotifications: Boolean(emailNotifications)
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error updating user settings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})