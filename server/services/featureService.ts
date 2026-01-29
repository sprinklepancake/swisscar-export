// server/services/featureService.ts - UPDATED VERSION
import { Op } from 'sequelize'
import { Car, User, TransactionLog } from '~/server/database/models'
import { WalletService } from './walletService'

export class FeatureService {
  // Feature pricing configuration - NOW WITH ADMIN CONTROLS
  private static featurePrice = 5 // CHF
  private static featureDurationDays = 7 // days
  private static listingsPerFreeFeature = 10 // 1 free feature per 10 listings
  private static allowPermanentFeature = true // Admin can toggle this
  private static permanentFeaturePrice = 50 // CHF for permanent feature

  /**
   * Get current feature configuration
   */
// In server/services/featureService.ts, update the getFeatureConfig method:
static async getFeatureConfig() {
  // Use Settings model instead of static properties
  const price = await Settings.getSetting('featurePrice', 5)
  const durationDays = await Settings.getSetting('featureDurationDays', 7)
  const listingsPerFreeFeature = await Settings.getSetting('listingsPerFreeFeature', 10)
  const permanentFeaturePrice = await Settings.getSetting('permanentFeaturePrice', 50)
  const allowPermanentFeature = await Settings.getSetting('allowPermanentFeature', true)
  
  return {
    price,
    durationDays,
    listingsPerFreeFeature,
    allowPermanentFeature,
    permanentFeaturePrice
  }
}

// Update updateFeatureConfig method:
static async updateFeatureConfig(config: {
  price?: number
  durationDays?: number
  listingsPerFreeFeature?: number
  allowPermanentFeature?: boolean
  permanentFeaturePrice?: number
}) {
  if (config.price !== undefined) {
    if (config.price < 1) throw new Error('Feature price must be at least 1 CHF')
    await Settings.setSetting('featurePrice', config.price, {
      description: 'Price for temporary feature',
      category: 'features',
      dataType: 'number'
    })
  }
  
  if (config.durationDays !== undefined) {
    if (config.durationDays < 1 && config.durationDays !== 0) 
      throw new Error('Feature duration must be at least 1 day or 0 for permanent')
    await Settings.setSetting('featureDurationDays', config.durationDays, {
      description: 'Duration of temporary feature in days',
      category: 'features',
      dataType: 'number'
    })
  }
  
  if (config.listingsPerFreeFeature !== undefined) {
    if (config.listingsPerFreeFeature < 1) 
      throw new Error('Listings per free feature must be at least 1')
    await Settings.setSetting('listingsPerFreeFeature', config.listingsPerFreeFeature, {
      description: 'Users get 1 free feature for every X listings',
      category: 'features',
      dataType: 'number'
    })
  }
  
  if (config.allowPermanentFeature !== undefined) {
    await Settings.setSetting('allowPermanentFeature', config.allowPermanentFeature, {
      description: 'Allow permanent features',
      category: 'features',
      dataType: 'boolean'
    })
  }
  
  if (config.permanentFeaturePrice !== undefined) {
    if (config.permanentFeaturePrice < 10) 
      throw new Error('Permanent feature price must be at least 10 CHF')
    await Settings.setSetting('permanentFeaturePrice', config.permanentFeaturePrice, {
      description: 'Price for permanent feature',
      category: 'features',
      dataType: 'number'
    })
  }
  
  console.log('📝 Feature config updated:', config)
  return await this.getFeatureConfig()
}




  /**
   * Update user's free feature credits based on their listings
   */
  static async updateUserFreeFeatureCredits(userId: number) {
    try {
      const user = await User.findByPk(userId)
      if (!user) return
      
      // Count user's active listings
      const listingCount = await Car.count({
        where: {
          sellerId: userId,
          status: 'active'
        }
      })
      
      // Calculate earned free features
      const earnedFeatures = Math.floor(listingCount / this.listingsPerFreeFeature)
      
      // Get already used free features
      const usedFreeFeatures = user.getDataValue('usedFreeFeatures') || 0
      
      // Calculate available free features (earned - used)
      const availableFreeFeatures = Math.max(0, earnedFeatures - usedFreeFeatures)
      
      await user.update({
        totalListings: listingCount,
        freeFeatureCredits: availableFreeFeatures
      })
      
      console.log('🔄 Updated user free feature credits:', {
        userId,
        listingCount,
        earnedFeatures,
        usedFreeFeatures,
        availableFreeFeatures
      })
      
      return availableFreeFeatures
    } catch (error) {
      console.error('❌ Error updating user free feature credits:', error)
      return 0
    }
  }

  /**
   * Feature a car listing with options
   */
  static async featureCar(
    userId: number, 
    carId: number, 
    options: {
      useFreeCredit?: boolean
      permanent?: boolean
      customDuration?: number
    } = {}
  ) {
    try {
      const { useFreeCredit = false, permanent = false, customDuration } = options
      
      // Get car
      const car = await Car.findByPk(carId)
      if (!car) {
        throw new Error('Car not found')
      }

      // Verify ownership
      if (car.getDataValue('sellerId') !== userId) {
        throw new Error('You do not own this car listing')
      }

      // Check if car is active
      if (car.getDataValue('status') !== 'active') {
        throw new Error('Only active listings can be featured')
      }

      // Check if already featured and active
      if (car.getDataValue('isFeatured') && car.isFeaturedActive()) {
        throw new Error('This car is already featured')
      }

      // Get user
      const user = await User.findByPk(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Calculate cost and duration
      let cost = 0
      let durationDays = customDuration || this.featureDurationDays
      let isFree = false
      let description = ''
      let usedFreeCredit = false

      // PERMANENT FEATURE
      if (permanent && this.allowPermanentFeature) {
        cost = this.permanentFeaturePrice
        durationDays = 0 // 0 means permanent
        description = `Permanent featured listing (${cost} CHF)`
      }
      // FREE CREDIT
      else if (useFreeCredit) {
        const freeCredits = user.getDataValue('freeFeatureCredits') || 0
        if (freeCredits < 1) {
          throw new Error('No free feature credits available')
        }
        isFree = true
        usedFreeCredit = true
        description = `Free featured listing (using credit)`
      }
      // PAID FEATURE
      else {
        cost = this.featurePrice
        description = `Featured listing payment (${cost} CHF for ${durationDays} days)`
      }

      // Check funds if not free
      if (cost > 0) {
        const userBalance = parseFloat(user.getDataValue('funds')) || 0
        if (userBalance < cost) {
          throw new Error(`Insufficient funds. You need ${cost} CHF. Your balance is ${userBalance} CHF.`)
        }
        
        // Deduct funds
        await WalletService.deductFunds(userId, cost, description)
      }

      // Calculate featured until date
      let featuredUntil = null
      if (durationDays > 0) {
        featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + durationDays)
      }
      // durationDays = 0 means permanent until sold/removed

      // Update user's free credits if used
      if (usedFreeCredit) {
        const usedFreeFeatures = (user.getDataValue('usedFreeFeatures') || 0) + 1
        await user.update({
          usedFreeFeatures,
          freeFeatureCredits: Math.max(0, (user.getDataValue('freeFeatureCredits') || 0) - 1)
        })
      }

      // Update car
      await car.update({
        isFeatured: true,
        featuredUntil,
        permanentFeature: permanent || false
      })

      console.log('✅ Car featured:', {
        carId,
        userId,
        featuredUntil,
        permanent,
        isFree,
        cost,
        durationDays: durationDays === 0 ? 'permanent' : durationDays,
        usedFreeCredit
      })

      return {
        success: true,
        carId,
        featuredUntil,
        permanent,
        isFree,
        cost,
        durationDays: durationDays === 0 ? 'permanent' : durationDays,
        usedFreeCredit
      }
    } catch (error: any) {
      console.error('❌ Error featuring car:', error)
      throw error
    }
  }

  /**
   * Check if a car can be featured by user with all options
   */
  static async canFeatureCar(userId: number, carId: number) {
    try {
      const car = await Car.findByPk(carId)
      if (!car) {
        return { canFeature: false, reason: 'Car not found' }
      }

      // Check ownership
      if (car.getDataValue('sellerId') !== userId) {
        return { canFeature: false, reason: 'You do not own this car listing' }
      }

      // Check status
      if (car.getDataValue('status') !== 'active') {
        return { canFeature: false, reason: 'Only active listings can be featured' }
      }

      // Check if already featured and active
      if (car.getDataValue('isFeatured') && car.isFeaturedActive()) {
        return { canFeature: false, reason: 'This car is already featured' }
      }

      // Get user
      const user = await User.findByPk(userId)
      if (!user) {
        return { canFeature: false, reason: 'User not found' }
      }

      // Update free credits first
      await this.updateUserFreeFeatureCredits(userId)
      
      // Get updated user data
      const updatedUser = await User.findByPk(userId)
      if (!updatedUser) {
        return { canFeature: false, reason: 'User not found' }
      }

      const freeCredits = updatedUser.getDataValue('freeFeatureCredits') || 0
      const userBalance = parseFloat(updatedUser.getDataValue('funds')) || 0
      const listingCount = updatedUser.getDataValue('totalListings') || 0
      const usedFreeFeatures = updatedUser.getDataValue('usedFreeFeatures') || 0
      
      // Calculate earned features
      const earnedFeatures = Math.floor(listingCount / this.listingsPerFreeFeature)

      return {
        canFeature: true,
        freeCredits,
        freeCreditsAvailable: freeCredits > 0,
        earnedFreeFeatures: earnedFeatures,
        usedFreeFeatures,
        userBalance,
        listingCount,
        listingsPerFreeFeature: this.listingsPerFreeFeature,
        price: this.featurePrice,
        permanentFeaturePrice: this.permanentFeaturePrice,
        allowPermanentFeature: this.allowPermanentFeature,
        durationDays: this.featureDurationDays,
        // Calculate next free feature
        nextFreeFeatureAt: (earnedFeatures + 1) * this.listingsPerFreeFeature,
        listingsUntilNextFreeFeature: Math.max(0, ((earnedFeatures + 1) * this.listingsPerFreeFeature) - listingCount)
      }
    } catch (error) {
      console.error('❌ Error checking if car can be featured:', error)
      return { canFeature: false, reason: 'Error checking feature eligibility' }
    }
  }

  /**
   * Get active featured cars (all of them, no limit)
   */
  static async getActiveFeaturedCars() {
    try {
      const now = new Date()
      
      const featuredCars = await Car.findAll({
        where: {
          isFeatured: true,
          status: 'active',
          [Op.or]: [
            // Permanent features (featuredUntil is null and permanentFeature is true)
            {
              permanentFeature: true,
              featuredUntil: null
            },
            // Temporary features that haven't expired
            {
              permanentFeature: false,
              featuredUntil: { 
                [Op.gt]: now 
              }
            }
          ]
        },
        order: [
          // Permanent features first
          ['permanentFeature', 'DESC'],
          // Then by featured until date (soonest to expire last)
          ['featuredUntil', 'ASC'],
          // Then by creation date
          ['createdAt', 'DESC']
        ],
        include: [
          {
            association: 'seller',
            attributes: ['id', 'name', 'email', 'phone', 'companyName']
          }
        ]
      })

      return featuredCars.map(car => ({
        id: car.getDataValue('id'),
        sellerId: car.getDataValue('sellerId'),
        make: car.getDataValue('make'),
        model: car.getDataValue('model'),
        year: car.getDataValue('year'),
        price: car.getDataValue('price'),
        startingPrice: car.getDataValue('startingPrice'),
        listingType: car.getDataValue('listingType'),
        images: car.getDataValue('images'),
        condition: car.getDataValue('condition'),
        mileage: car.getDataValue('mileage'),
        fuelType: car.getDataValue('fuelType'),
        transmission: car.getDataValue('transmission'),
        bodyType: car.getDataValue('bodyType'),
        power: car.getDataValue('powerPs'),
        powerPs: car.getDataValue('powerPs'),
        powerKw: car.getDataValue('powerKw'),
        cylinders: car.getDataValue('cylinders'),
        seats: car.getDataValue('seats'),
        driveType: car.getDataValue('driveType'),
        colorExterior: car.getDataValue('colorExterior'),
        colorInterior: car.getDataValue('colorInterior'),
        doors: car.getDataValue('doors'),
        withWarranty: car.getDataValue('withWarranty'),
        validInspection: car.getDataValue('validInspection'),
        hasAccident: car.getDataValue('hasAccident'),
        equipment: car.getDataValue('equipment'),
        sellerType: car.getDataValue('sellerType'),
        sellerName: car.getDataValue('sellerName') || (car.seller?.getDataValue('name') || 'Private Seller'),
        sellerPhone: car.getDataValue('sellerPhone'),
        sellerEmail: car.getDataValue('sellerEmail'),
        city: car.getDataValue('city'),
        canton: car.getDataValue('canton'),
        location: car.getDataValue('location'),
        zipCode: car.getDataValue('zipCode'),
        streetAddress: car.getDataValue('streetAddress'),
        exportDocuments: car.getDataValue('exportDocuments'),
        featuredUntil: car.getDataValue('featuredUntil'),
        permanentFeature: car.getDataValue('permanentFeature'),
        featuredDaysRemaining: car.getDataValue('featuredUntil') 
          ? Math.max(0, Math.ceil((new Date(car.getDataValue('featuredUntil')).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : car.getDataValue('permanentFeature') ? 'permanent' : 0,
        seller: car.seller ? {
          id: car.seller.getDataValue('id'),
          name: car.seller.getDataValue('name'),
          email: car.seller.getDataValue('email'),
          phone: car.seller.getDataValue('phone'),
          companyName: car.seller.getDataValue('companyName')
        } : null
      }))
    } catch (error) {
      console.error('❌ Error getting featured cars:', error)
      return []
    }
  }

  /**
   * Unfeature a car (admin only or when sold)
   */
  static async unfeatureCar(carId: number) {
    try {
      const car = await Car.findByPk(carId)
      if (!car) {
        throw new Error('Car not found')
      }

      await car.update({
        isFeatured: false,
        featuredUntil: null,
        permanentFeature: false
      })

      console.log('✅ Car unfeatured:', { carId })
      return { success: true, carId }
    } catch (error: any) {
      console.error('❌ Error unfeaturing car:', error)
      throw error
    }
  }

  /**
   * Check and update expired featured listings
   */
  static async updateExpiredFeatured() {
    try {
      const now = new Date()
      
      const expiredCars = await Car.findAll({
        where: {
          isFeatured: true,
          permanentFeature: false, // Don't expire permanent features
          featuredUntil: {
            [Op.lt]: now
          }
        }
      })

      for (const car of expiredCars) {
        await car.update({
          isFeatured: false,
          featuredUntil: null
        })
        console.log('⏰ Expired featured status removed:', car.getDataValue('id'))
      }

      return {
        success: true,
        expiredCount: expiredCars.length,
        message: `Removed featured status from ${expiredCars.length} expired listings`
      }
    } catch (error) {
      console.error('❌ Error updating expired featured listings:', error)
      throw error
    }
  }
}