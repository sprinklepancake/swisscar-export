// server/api/cars/[id]/can-feature.get.ts - NEW FILE
import jwt from 'jsonwebtoken'
import { FeatureService } from '~/server/services/featureService'

export default defineEventHandler(async (event) => {
  try {
    const carId = event.context.params?.id
    if (!carId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Car ID is required'
      })
    }
    
    // Get authenticated user
    const accessToken = getCookie(event, 'access_token')
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'You must be logged in'
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
        statusMessage: 'Invalid or expired token. Please log in again.'
      })
    }
    
    const userId = decodedToken.userId
    
    // Check if user can feature the car
    const result = await FeatureService.canFeatureCar(userId, parseInt(carId))
    
    return result
    
  } catch (error: any) {
    console.error('❌ Error checking feature eligibility:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})