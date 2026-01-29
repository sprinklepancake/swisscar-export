// server/api/feature/config.get.ts - NEW FILE
import { FeatureService } from '~/server/services/featureService'

export default defineEventHandler(async (event) => {
  try {
    const config = FeatureService.getFeatureConfig()
    
    return {
      success: true,
      config
    }
  } catch (error: any) {
    console.error('❌ Error getting feature config:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})