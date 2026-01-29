// server/api/admin/listing-fees.post.ts
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
    const { normalListingFee, auctionListingFee } = body
    
    if (normalListingFee === undefined || auctionListingFee === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Both normalListingFee and auctionListingFee are required'
      })
    }
    
    const normalFee = parseFloat(normalListingFee)
    const auctionFee = parseFloat(auctionListingFee)
    
    if (isNaN(normalFee) || normalFee < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Normal listing fee must be a positive number'
      })
    }
    
    if (isNaN(auctionFee) || auctionFee < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Auction listing fee must be a positive number'
      })
    }
    
    // Save settings using Settings model
    await Settings.setSetting('normalListingFee', normalFee, {
      description: 'Fee for normal car listings',
      category: 'fees',
      dataType: 'number',
      updatedBy: decodedToken.userId
    })
    
    await Settings.setSetting('auctionListingFee', auctionFee, {
      description: 'Fee for auction listings',
      category: 'fees',
      dataType: 'number',
      updatedBy: decodedToken.userId
    })
    
    // Log the action
    console.log('📝 Listing fees updated:', {
      normalFee,
      auctionFee,
      adminId: decodedToken.userId,
      timestamp: new Date().toISOString()
    })
    
    return {
      success: true,
      message: 'Listing fees updated successfully',
      fees: {
        normalListingFee: normalFee,
        auctionListingFee: auctionFee
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error updating listing fees:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})