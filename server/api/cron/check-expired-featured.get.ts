// server/api/cron/check-expired-featured.get.ts - NEW FILE
import { FeatureService } from '~/server/services/featureService'

export default defineEventHandler(async (event) => {
  try {
    // This endpoint should be called by a cron job (e.g., every hour)
    // You can also call it manually for testing
    
    const result = await FeatureService.updateExpiredFeatured()
    
    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('❌ Error checking expired featured:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})