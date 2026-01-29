// server/api/cars/[id]/feature.post.ts - UPDATED WITH TRANSACTION LOGGING
import jwt from 'jsonwebtoken'
import { FeatureService } from '~/server/services/featureService'
import { TransactionLog } from '~/server/database/models/TransactionLog'

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
        statusMessage: 'You must be logged in to feature a car'
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
    
    // Get request body for feature options
    const body = await readBody(event)
    const { useFreeCredit = false, permanent = false, customDuration } = body
    
    // Check if user can feature the car
    const canFeature = await FeatureService.canFeatureCar(userId, parseInt(carId))
    
    if (!canFeature.canFeature) {
      throw createError({
        statusCode: 400,
        statusMessage: canFeature.reason || 'Cannot feature this car'
      })
    }
    
    // Import needed models and services
    const { Car, User } = await import('~/server/database/models')
    const { updateUser } = await import('~/server/database/repositories/userRepository')
    
    // Get car and user
    const car = await Car.findByPk(carId)
    if (!car) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Car not found'
      })
    }
    
    const user = await User.findByPk(userId)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Determine cost and transaction type
    let cost = 0
    let transactionType = 'feature_payment'
    let description = ''
    
    if (permanent && canFeature.allowPermanentFeature) {
      cost = canFeature.permanentFeaturePrice
      transactionType = 'permanent_feature_payment'
      description = `Permanent feature for ${car.make} ${car.model}`
    } else if (useFreeCredit && canFeature.freeCreditsAvailable) {
      cost = 0
      transactionType = 'free_feature'
      description = `Free feature (using credit) for ${car.make} ${car.model}`
    } else {
      cost = canFeature.price
      description = `${customDuration || canFeature.durationDays}-day feature for ${car.make} ${car.model}`
    }
    
    // Get current balance
    const previousBalance = parseFloat(user.getDataValue('funds')) || 0
    
    // Check funds if not free
    if (cost > 0 && previousBalance < cost) {
      throw createError({
        statusCode: 402,
        statusMessage: `Insufficient funds. You need ${cost} CHF to feature this car. Your current balance is ${previousBalance} CHF.`
      })
    }
    
    let transactionLog = null
    
    // Create transaction log if not free
    if (cost > 0) {
      const newBalance = previousBalance - cost
      
      transactionLog = await TransactionLog.create({
        userId,
        type: transactionType as any,
        amount: -cost,
        previousBalance,
        newBalance,
        description,
        referenceId: `FEATURE-${carId}-${Date.now()}`,
        metadata: {
          carId: parseInt(carId),
          carMake: car.getDataValue('make'),
          carModel: car.getDataValue('model'),
          featureType: permanent ? 'permanent' : 'temporary',
          durationDays: customDuration || canFeature.durationDays,
          cost,
          isFree: cost === 0,
          usedFreeCredit: useFreeCredit
        }
      })
      
      // Update user funds
      await updateUser(userId, { funds: newBalance })
      
      console.log(`✅ Feature transaction logged: ID ${transactionLog.id}`)
    }
    
    // Update user's free credits if used
    if (useFreeCredit) {
      const usedFreeFeatures = (user.getDataValue('usedFreeFeatures') || 0) + 1
      await user.update({
        usedFreeFeatures,
        freeFeatureCredits: Math.max(0, (user.getDataValue('freeFeatureCredits') || 0) - 1)
      })
    }
    
    // Calculate featured until date
    let featuredUntil = null
    const durationDays = customDuration || canFeature.durationDays
    if (durationDays > 0 && !permanent) {
      featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + durationDays)
    }
    
    // Update car
    await car.update({
      isFeatured: true,
      featuredUntil: permanent ? null : featuredUntil,
      permanentFeature: permanent || false
    })
    
    console.log('✅ Car featured successfully:', {
      carId,
      userId,
      featuredUntil,
      permanent,
      cost,
      durationDays,
      transactionId: transactionLog?.id
    })
    
    return {
      success: true,
      message: cost === 0 
        ? 'Car featured successfully (free during first 6 months)!' 
        : `Car featured successfully! ${cost} CHF deducted from your account.`,
      data: {
        carId,
        featuredUntil,
        permanent,
        cost,
        durationDays,
        transaction: transactionLog ? {
          id: transactionLog.id,
          amount: transactionLog.amount,
          newBalance: transactionLog.newBalance
        } : null
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error featuring car:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})