// server/api/user/profile.get.ts
import jwt from 'jsonwebtoken'
import { getUserById } from '../../database/repositories/userRepository'
import { Watchlist } from '../../database/models/Watchlist' // ADD THIS IMPORT
import { Car } from '../../database/models/Car'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Profile API Debug Start ===')
    
    // First try to get user from context (set by middleware)
    let user = event.context.user || event.context.auth
    
    console.log('Profile API - Context user:', event.context.user)
    console.log('Profile API - Context auth:', event.context.auth)
    
    // If context doesn't have user, verify token directly
    if (!user || !user.id) {
      console.log('Profile API - No user in context, verifying token directly...')
      const accessToken = getCookie(event, 'access_token')
      
      console.log('Profile API - Access token from cookie:', accessToken ? 'Present' : 'Missing')
      
      if (!accessToken) {
        console.log('Profile API - No access token found')
        throw createError({
          statusCode: 401,
          statusMessage: 'Please login to view your profile'
        })
      }

      try {
        const config = useRuntimeConfig()
        console.log('Profile API - Verifying token...')
        
        const decoded = jwt.verify(accessToken, config.jwtAccessSecret) as any
        console.log('Profile API - Decoded token:', decoded)
        
        const userId = decoded.userId || decoded.id
        console.log('Profile API - Extracted user ID:', userId)
        
        if (!userId) {
          console.log('Profile API - No user ID found in token')
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid authentication token'
          })
        }

const dbUser = await getUserById(userId)
console.log('Profile API - Database user found:', !!dbUser)

if (!dbUser) {
  throw createError({ statusCode: 401, statusMessage: 'User not found' })
}

// Get real balance from database
const userBalance = parseFloat(dbUser.getDataValue('funds')) || 0

user = {
  id: dbUser.getDataValue('id'),
  email: dbUser.getDataValue('email'),
  name: dbUser.getDataValue('name'),
  role: dbUser.getDataValue('role'),
  funds: userBalance, // REAL BALANCE
  banned: dbUser.getDataValue('banned') || false,
  createdAt: dbUser.getDataValue('createdAt'),
  phone: dbUser.getDataValue('phone') || '',
  companyName: dbUser.getDataValue('companyName') || '',
  businessType: dbUser.getDataValue('businessType') || '',
  canton: dbUser.getDataValue('canton') || '',
  city: dbUser.getDataValue('city') || '',
  zipCode: dbUser.getDataValue('zipCode') || '',
  streetAddress: dbUser.getDataValue('streetAddress') || ''
}
        
        console.log('Profile API - User object created:', user)
      } catch (tokenError) {
        console.error('Profile API - Token verification failed:', tokenError)
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid authentication token'
        })
      }
    }

    console.log('Profile API - Final user object:', user)
    
    if (!user || !user.id) {
      console.log('Profile API - No valid user object')
      throw createError({
        statusCode: 401,
        statusMessage: 'User authentication failed'
      })
    }

    console.log('Profile API - User authenticated:', user.id, user.name)
    
    // Fetch all data in parallel
    const [stats, activity] = await Promise.all([
      getStats(user.id, user.role),
      getActivity(user.id, user.role)
    ])

    console.log('=== Profile API Debug End - Success ===')
    
// In profile.get.ts, find the return statement and update it:
return {
  user: {
    id: user.id,
    name: user.name,
    email: user.email, // Add this
    role: user.role,
    joinedAt: user.createdAt || new Date().toISOString(),
    funds: user.funds || 0,
    banned: user.banned || false,
    phone: user.phone || '', // Add this
    companyName: user.companyName || '', // Add this
    businessType: user.businessType || '', // Add this
    canton: user.canton || '', // Add this
    city: user.city || '', // Add this
    zipCode: user.zipCode || '', // Add this
    streetAddress: user.streetAddress || '', // Add this
    verifiedBuyer: user.verifiedBuyer || false // Add this
  },
  stats,
  activity
}
  } catch (error: any) {
    console.error('Profile API error:', error)
    
    if (error.statusCode === 401) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Failed to load profile data' 
    })
  }
})

// Updated stats function with new structure
// Update the getStats function to fetch real statistics:
const getStats = async (userId: number, userRole: string) => {
  try {
    if (userRole === 'seller') {
      // Get seller's car statistics
      const userCars = await Car.findAll({
        where: { sellerId: userId }
      })
      
      const activeListings = userCars.filter(car => {
        const status = car.getDataValue('status')
        return status === 'active' || status === 'auction'
      }).length
      
      const carsSold = userCars.filter(car => {
        const status = car.getDataValue('status')
        return status === 'sold'
      }).length
      
      const totalListings = userCars.length
      
      return {
        carsSold,
        carsBought: 0,
        activeListings,
        watchlistCount: 0,
        totalListings
      }
    } else {
      // For buyers, get watchlist count
      const watchlistCount = await Watchlist.count({ where: { userId } })
      
      // For buyers, we might need to calculate cars bought from bids or transactions
      // For now, return 0
      return {
        carsSold: 0,
        carsBought: 0,
        activeListings: 0,
        watchlistCount,
        totalListings: 0
      }
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      carsSold: 0,
      carsBought: 0,
      activeListings: 0,
      watchlistCount: 0,
      totalListings: 0
    }
  }
}

const getActivity = async (userId: number, userRole: string) => {
  try {
    // TODO: Replace with your actual activity queries
    if (userRole === 'seller') {
      return [
        {
          id: 1,
          message: 'Listed BMW X5 for sale',
          date: new Date('2024-11-15').toISOString()
        },
        {
          id: 2,
          message: 'Received inquiry about Audi A4',
          date: new Date('2024-11-12').toISOString()
        },
        {
          id: 3,
          message: 'Updated Mercedes C-Class listing',
          date: new Date('2024-11-10').toISOString()
        }
      ]
    } else {
      return [
        {
          id: 1,
          message: 'Added BMW X5 to watchlist',
          date: new Date('2024-11-15').toISOString()
        },
        {
          id: 2,
          message: 'Added 500 CHF to account',
          date: new Date('2024-11-10').toISOString()
        },
        {
          id: 3,
          message: 'Contacted seller about Mercedes C-Class',
          date: new Date('2024-11-05').toISOString()
        }
      ]
    }
  } catch (error) {
    console.error('Error getting activity:', error)
    return []
  }
}