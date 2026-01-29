// server/api/admin/feature-stats.get.ts - FIXED (remove status condition)
import jwt from 'jsonwebtoken'
import { Car, User, TransactionLog, Settings } from '~/server/database/models'
import { Op } from 'sequelize'

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
    
    const now = new Date()
    console.log('🔍 Fetching feature stats at:', now.toISOString())
    
    // FIXED QUERY: Get active featured cars
    const activeFeaturedCars = await Car.count({
      where: {
        isFeatured: true,
        status: 'active',
        [Op.or]: [
          // Permanent features
          { permanentFeature: true },
          // Temporary features that are still active
          {
            permanentFeature: false,
            [Op.or]: [
              // Has featuredUntil date in future
              {
                featuredUntil: {
                  [Op.gt]: now
                }
              },
              // OR has no featuredUntil date (should still count as active)
              {
                featuredUntil: null
              }
            ]
          }
        ]
      }
    })
    
    console.log(`⭐ Active featured cars found: ${activeFeaturedCars}`)
    
    // Get permanent features count
    const permanentFeatures = await Car.count({
      where: {
        isFeatured: true,
        permanentFeature: true,
        status: 'active'
      }
    })
    
    console.log(`♾️ Permanent features: ${permanentFeatures}`)
    
    // Get total free features used across all users
    const usersWithFreeFeatures = await User.findAll({
      attributes: ['id', 'name', 'usedFreeFeatures']
    })
    
    const freeFeaturesUsed = usersWithFreeFeatures.reduce((total, user) => {
      return total + (user.getDataValue('usedFreeFeatures') || 0)
    }, 0)
    
    console.log(`🎁 Free features used: ${freeFeaturesUsed}`)
    
    // FIXED: Get feature revenue from transaction logs - REMOVED status condition
    const featureTransactions = await TransactionLog.findAll({
      where: {
        [Op.or]: [
          { type: 'feature_payment' },
          { type: 'permanent_feature_payment' }
        ]
        // REMOVED: status: 'completed' - TransactionLog doesn't have status column
      }
    })
    
    const featureRevenue = featureTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.getDataValue('amount')) || 0
      return total + amount
    }, 0)
    
    console.log(`💰 Total feature revenue: ${featureRevenue} CHF`)
    console.log(`💰 Feature transactions found: ${featureTransactions.length}`)
    
    // Get current feature settings - with fallback if Settings doesn't exist
    let featureSettings
    try {
      // Check if Settings model exists and has data
      const SettingsModel = Settings as any
      
      // Try to get settings, fall back to defaults if fails
      featureSettings = {
        price: await SettingsModel.getSetting?.('featurePrice', 5) ?? 5,
        durationDays: await SettingsModel.getSetting?.('featureDurationDays', 7) ?? 7,
        listingsPerFreeFeature: await SettingsModel.getSetting?.('listingsPerFreeFeature', 10) ?? 10,
        permanentFeaturePrice: await SettingsModel.getSetting?.('permanentFeaturePrice', 50) ?? 50,
        allowPermanentFeature: await SettingsModel.getSetting?.('allowPermanentFeature', true) ?? true
      }
    } catch (error) {
      console.log('⚠️ Using default feature settings:', error)
      featureSettings = {
        price: 5,
        durationDays: 7,
        listingsPerFreeFeature: 10,
        permanentFeaturePrice: 50,
        allowPermanentFeature: true
      }
    }
    
    console.log('⚙️ Feature settings:', featureSettings)
    
    // Get users with free feature credits
    const usersWithCredits = await User.count({
      where: {
        freeFeatureCredits: {
          [Op.gt]: 0
        }
      }
    })
    
    console.log(`👥 Users with credits: ${usersWithCredits}`)
    
    // Get total active listings
    const totalListings = await Car.count({
      where: {
        status: 'active'
      }
    })
    
    console.log(`📊 Total active listings: ${totalListings}`)
    
    // Debug: Let's also check what cars are actually being counted
    const featuredCarsList = await Car.findAll({
      where: {
        isFeatured: true,
        status: 'active',
        [Op.or]: [
          { permanentFeature: true },
          {
            permanentFeature: false,
            [Op.or]: [
              { featuredUntil: { [Op.gt]: now } },
              { featuredUntil: null }
            ]
          }
        ]
      },
      attributes: ['id', 'make', 'model', 'featuredUntil', 'permanentFeature']
    })
    
    console.log('📋 Active featured cars list:')
    featuredCarsList.forEach(car => {
      console.log(`  - ID ${car.id}: ${car.make} ${car.model} (featuredUntil: ${car.featuredUntil}, permanent: ${car.permanentFeature})`)
    })
    
    return {
      success: true,
      stats: {
        activeFeaturedCars,
        permanentFeatures,
        freeFeaturesUsed,
        featureRevenue: Math.round(featureRevenue * 100) / 100,
        usersWithCredits,
        totalListings,
        settings: featureSettings
      },
      debug: {
        featuredCarsCount: featuredCarsList.length,
        featuredCars: featuredCarsList.map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          featuredUntil: car.featuredUntil,
          permanentFeature: car.permanentFeature
        }))
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error getting feature stats:', error)
    console.error('Error details:', error.stack)
    
    // Return zeros but with error info
    return {
      success: false,
      error: error.message,
      stats: {
        activeFeaturedCars: 0,
        permanentFeatures: 0,
        freeFeaturesUsed: 0,
        featureRevenue: 0,
        usersWithCredits: 0,
        totalListings: 0,
        settings: {
          price: 5,
          durationDays: 7,
          listingsPerFreeFeature: 10,
          permanentFeaturePrice: 50,
          allowPermanentFeature: true
        }
      }
    }
  }
})