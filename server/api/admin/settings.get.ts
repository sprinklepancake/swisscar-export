// server/api/admin/settings.get.ts
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
    
    // Get all settings grouped by category
    const allSettings = await Settings.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    })
    
    // Group settings by category
    const settingsByCategory: Record<string, any[]> = {}
    allSettings.forEach(setting => {
      const category = setting.getDataValue('category') || 'general'
      if (!settingsByCategory[category]) {
        settingsByCategory[category] = []
      }
      
      settingsByCategory[category].push({
        key: setting.getDataValue('key'),
        value: setting.getTypedValue(),
        description: setting.getDataValue('description'),
        dataType: setting.getDataValue('dataType'),
        isPublic: setting.getDataValue('isPublic'),
        createdAt: setting.getDataValue('createdAt'),
        updatedAt: setting.getDataValue('updatedAt'),
        updatedBy: setting.getDataValue('updatedBy')
      })
    })
    
    // Get commonly used settings for admin panel
    const commonSettings = {
      listingFees: {
        normalListingFee: await Settings.getSetting('normalListingFee', 7.5),
        auctionListingFee: await Settings.getSetting('auctionListingFee', 10)
      },
      featureSettings: {
        price: await Settings.getSetting('featurePrice', 5),
        durationDays: await Settings.getSetting('featureDurationDays', 7),
        listingsPerFreeFeature: await Settings.getSetting('listingsPerFreeFeature', 10),
        permanentFeaturePrice: await Settings.getSetting('permanentFeaturePrice', 50),
        allowPermanentFeature: await Settings.getSetting('allowPermanentFeature', true)
      },
      userSettings: {
        requireIdVerification: await Settings.getSetting('requireIdVerification', true),
        freeFirstSixMonths: await Settings.getSetting('freeFirstSixMonths', true),
        autoExpireFeatures: await Settings.getSetting('autoExpireFeatures', true),
        emailNotifications: await Settings.getSetting('emailNotifications', true)
      }
    }
    
    return {
      success: true,
      settings: commonSettings,
      allSettings: settingsByCategory,
      count: allSettings.length
    }
    
  } catch (error: any) {
    console.error('❌ Error getting settings:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})