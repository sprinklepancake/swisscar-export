// server/api/bids/canBid.get.ts - FIXED VERSION
import { User } from '../../database/models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CAN BID CHECK START ===')
    
    // DEBUG: Log the entire context to see what's available
    console.log('Event context keys:', Object.keys(event.context))
    console.log('Full event.context:', event.context)
    
    // Try to get user from context.auth (which is the user object from middleware)
    const userFromContext = event.context.auth
    console.log('User from context.auth:', userFromContext)
    
    let userId = null
    let email = null
    
    if (userFromContext) {
      // The auth middleware sets the entire user object to event.context.auth
      // So we need to get the id property directly
      userId = userFromContext.id || userFromContext.userId
      email = userFromContext.email
      console.log('Got user from context.auth:', { userId, email, fullObject: userFromContext })
    } else {
      // Fallback: try to get from token directly
      console.log('No user in context.auth, trying to get from token...')
      const accessToken = getCookie(event, 'access_token')
      if (accessToken) {
        try {
          const config = useRuntimeConfig()
          const decoded = jwt.verify(accessToken, config.jwtAccessSecret) as any
          userId = decoded.userId || decoded.id
          email = decoded.email
          console.log('Got user from token:', { userId, email })
        } catch (error) {
          console.log('Failed to decode token:', error)
        }
      }
    }

    console.log('Effective user ID:', userId)

    if (!userId) {
      console.log('No user ID found')
      return {
        canBid: false,
        reason: 'not_authenticated',
        message: 'Please log in to place bids'
      }
    }

    const user = await User.findByPk(userId)
    console.log('User found in database:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('User not found in database')
      return {
        canBid: false,
        reason: 'user_not_found',
        message: 'User not found'
      }
    }

    // FIX: Use getDataValue() for Sequelize model instances
    const userData = {
      id: user.getDataValue('id'),
      email: user.getDataValue('email'),
      name: user.getDataValue('name'),
      role: user.getDataValue('role'),
      verified: user.getDataValue('verified') || false,
      funds: parseFloat(user.getDataValue('funds')) || 0,
      banned: user.getDataValue('banned') || false
    }

    // DEBUG: Log user verification status
    console.log('User verification status:', userData)

    // Check if banned
    if (userData.banned) {
      console.log('User is banned')
      return {
        canBid: false,
        reason: 'banned',
        userBanned: true,
        message: 'Your account has been banned from placing bids'
      }
    }

    // Check if verified - USING verified FIELD
    const isVerified = userData.verified === true
    console.log('Is user verified?', isVerified, 'Value:', userData.verified)
    
    if (!isVerified) {
      console.log('User is not verified')
      return {
        canBid: false,
        reason: 'not_verified',
        needsVerification: true,
        message: 'Only verified users can place bids. Please complete ID verification.'
      }
    }

    // Check funds
    const userFunds = userData.funds
    const hasFunds = userFunds > 0
    console.log('User funds:', userFunds, 'Has funds:', hasFunds)

    console.log('=== CAN BID CHECK END - USER CAN BID ===')
    return {
      canBid: true,
      user: {
        id: userData.id,
        name: userData.name,
        funds: userFunds,
        verified: userData.verified,
        banned: userData.banned,
        role: userData.role
      },
      requirements: {
        verified: true,
        notBanned: true,
        hasFunds,
        message: hasFunds ? 'You can place bids' : 'Add funds to your wallet to place bids'
      }
    }

  } catch (error) {
    console.error('Error checking bid eligibility:', error)
    return {
      canBid: false,
      reason: 'error',
      message: 'Error checking bid eligibility'
    }
  }
})