// server/api/cars/create.post.ts - UPDATED WITH TRANSACTION LOGGING
import { saveCar } from '~/server/utils/carStorage'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from '~/server/database/repositories/userRepository'
import { getUserField } from '~/server/utils/userAccess'
import { TransactionLog } from '~/server/database/models/TransactionLog'

export default defineEventHandler(async (event) => {
  try {
    // Get the access token from cookies
    const accessToken = getCookie(event, 'access_token')
    
    console.log('Access token present:', !!accessToken)
    
    if (!accessToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized. Please log in to create a car listing.'
      })
    }

    // Verify the JWT token
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
      console.log('Decoded token:', decodedToken)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token. Please log in again.'
      })
    }

    const body = await readBody(event)
    
    console.log('📨 Received form data:', body)
    
    // VALIDATE LOCATION FIELDS
    if (!body.canton || !body.city || !body.zipCode) {
      console.error('❌ Location fields missing:', { 
        canton: body.canton, 
        city: body.city,
        zipCode: body.zipCode 
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Location fields (canton, city, and ZIP code) are required'
      })
    }

    // Determine listing type and fee
    const listingType = body.listingType || 'normal'
    const auctionDuration = listingType === 'auction' ? 7 : 30 // 7 days for auction, 30 for normal
    
    // Calculate auction end date if auction listing
    let auctionEndDate = null
    if (listingType === 'auction') {
      auctionEndDate = new Date()
      auctionEndDate.setDate(auctionEndDate.getDate() + auctionDuration)
    }

    // Validate auction-specific fields
    if (listingType === 'auction') {
      // For auctions, startingPrice is required
      if (!body.startingPrice && !body.price) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Starting price is required for auction listings'
        })
      }
      
      // Use startingPrice as primary price for auctions
      body.price = body.startingPrice || body.price
      
      // Validate reserve price (optional but if provided, must be >= starting price)
      if (body.reservePrice && body.price) {
        if (parseFloat(body.reservePrice) < parseFloat(body.price)) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Reserve price must be greater than or equal to starting price'
          })
        }
      }
    }

    // Validate required fields
    const requiredFields = [
      'make', 'model', 'year', 'mileage', 'fuelType', 'transmission', 
      'price', 'sellerName', 'sellerPhone', 'sellerEmail', 
      'canton', 'city', 'zipCode'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    // Validate numeric fields
    if (isNaN(body.year) || body.year < 1990 || body.year > new Date().getFullYear()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid year'
      })
    }

    if (isNaN(body.mileage) || body.mileage < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid mileage'
      })
    }

    if (isNaN(body.price) || body.price <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid price'
      })
    }

    // Get seller by email from the form
    const sellerEmail = body.sellerEmail
    console.log('🔍 Looking up seller by email:', sellerEmail)
    
    let sellerId = null
    let sellerData = null
    let isFirstSixMonths = false
    
    if (sellerEmail) {
      try {
        const seller = await getUserByEmail(sellerEmail)
        
        if (seller) {
          // Found seller in database!
          sellerId = getUserField(seller, 'id')
          sellerData = {
            id: sellerId,
            name: getUserField(seller, 'name'),
            email: getUserField(seller, 'email'),
            phone: getUserField(seller, 'phone'),
            role: getUserField(seller, 'role'),
            funds: parseFloat(getUserField(seller, 'funds')) || 0,
            createdAt: getUserField(seller, 'createdAt'),
            verified: getUserField(seller, 'verified') || false,
            banned: getUserField(seller, 'banned') || false
          }
          
          console.log('✅ Found seller in database:', sellerData)
          
          // Update seller info from database
          body.sellerName = sellerData.name || body.sellerName
          body.sellerPhone = sellerData.phone || body.sellerPhone
        } else {
          console.log('⚠️ Seller email not found in database:', sellerEmail)
        }
      } catch (dbError) {
        console.error('Database error finding seller:', dbError)
      }
    }

    // ============================================
    // WALLET BALANCE CHECK AND DEDUCTION LOGIC
    // ============================================
    
    // Determine listing fee based on type
    const listingFee = listingType === 'auction' ? 10 : 7.5
    let transactionLog = null
    
    // Only check balance if we found the seller in database
    if (sellerData && sellerData.id && sellerData.role === 'seller') {
      console.log('💰 Checking seller wallet balance...')
      console.log(`📊 Listing type: ${listingType}, Fee: ${listingFee} CHF`)
      
      // Check if seller is in first 6 months (free period)
      const userJoinedDate = new Date(sellerData.createdAt)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      isFirstSixMonths = userJoinedDate > sixMonthsAgo
      
      if (isFirstSixMonths) {
        console.log('🎉 Seller is in first 6 months - listing is FREE!')
      } else {
        console.log(`💳 Seller balance: ${sellerData.funds} CHF, Required: ${listingFee} CHF`)
        
        // Check if seller has sufficient funds
        if (sellerData.funds < listingFee) {
          throw createError({
            statusCode: 402,
            statusMessage: `Insufficient funds. You need ${listingFee} CHF to post a ${listingType} listing. Your current balance is ${sellerData.funds} CHF.`
          })
        }
        
        // Deduct funds from seller's account
        try {
          const { updateUser } = await import('~/server/database/repositories/userRepository')
          
          const newBalance = sellerData.funds - listingFee
          await updateUser(sellerData.id, { funds: newBalance })
          
          console.log(`✅ Deducted ${listingFee} CHF from seller ${sellerData.id}`)
          console.log(`💰 New balance: ${newBalance} CHF`)
          
          // Create transaction log
          transactionLog = await TransactionLog.create({
            userId: sellerData.id,
            type: listingType === 'auction' ? 'auction_fee' : 'listing_fee',
            amount: -listingFee,
            previousBalance: sellerData.funds,
            newBalance: newBalance,
            description: `${listingType === 'auction' ? 'Auction' : 'Normal'} listing fee for ${body.make} ${body.model}`,
            referenceId: `LISTING-${Date.now()}`,
            metadata: {
              carMake: body.make,
              carModel: body.model,
              listingType: listingType,
              feeType: 'listing',
              listingFee: listingFee,
              isFirstSixMonths: false
            }
          })
          
          console.log(`📝 Transaction logged: ID ${transactionLog.id}`)
          
          // Update sellerData for logging
          sellerData.funds = newBalance
          
        } catch (deductionError) {
          console.error('❌ Failed to deduct funds:', deductionError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process payment. Please try again.'
          })
        }
      }
    } else if (sellerData && sellerData.id && sellerData.role !== 'seller') {
      console.log('⚠️ User is not a seller, skipping balance check')
    } else {
      console.log('⚠️ Seller not found in database or no sellerId, skipping balance check')
    }
    
    // ============================================
    // END WALLET LOGIC
    // ============================================

    // Create the proper Swiss address format
    const swissAddress = `${body.streetAddress || ''}, ${body.zipCode} ${body.city}`.trim()
    
    const locationDisplay = body.streetAddress 
      ? swissAddress 
      : `${body.zipCode} ${body.city}`

    // Create car listing object with auction fields
    const carListing = {
      make: body.make,
      model: body.model,
      year: parseInt(body.year),
      mileage: parseInt(body.mileage),
      fuelType: body.fuelType,
      transmission: body.transmission,
      price: listingType === 'normal' ? parseFloat(body.price) : null,
      startingPrice: listingType === 'auction' ? parseFloat(body.price) : null,
      negotiable: body.negotiable || false,
      bodyType: body.bodyType || '',
      color: body.colorExterior || body.color || '',
      doors: body.doors ? parseInt(body.doors) : null,
      seats: body.seats ? parseInt(body.seats) : null,
      features: body.equipment || body.features || [],
      description: body.description || '',
      sellerName: body.sellerName,
      sellerPhone: body.sellerPhone,
      sellerEmail: body.sellerEmail,
      sellerType: body.sellerType || 'private',
      
      // Seller ID (if found) or null
      sellerId: sellerId,
      
      // NEW: AUCTION FIELDS
      listingType: listingType,
      reservePrice: body.reservePrice ? parseFloat(body.reservePrice) : null,
      currentBid: listingType === 'auction' ? parseFloat(body.price) : null,
      highestBidderId: null,
      bidCount: 0,
      auctionDuration: auctionDuration,
      auctionEnd: auctionEndDate,
      
      // Set status based on listing type
      status: 'active', // Always 'active' for live listings

      // LOCATION FIELDS
      location: locationDisplay,
      city: body.city,
      canton: body.canton,
      zipCode: body.zipCode,
      streetAddress: body.streetAddress || '',
      
      isFeatured: Math.random() > 0.7,
      exportDocuments: body.exportDocuments || false,
      withWarranty: body.withWarranty || false,
      validInspection: body.validInspection || false,
      hasAccident: body.hasAccident || false,
      images: body.images && body.images.length > 0 ? body.images : ['/placeholder-car.jpg'],
      engineSize: body.engineSize || `${(Math.random() * 3 + 1).toFixed(1)}L`,
      condition: body.condition || 'excellent',
      power: body.power ? parseInt(body.power) : null,
      driveType: body.driveType || null,
      
      // TYPENSCHEIN FIELDS
      typenscheinNr: body.typenscheinNr || '',
      typenscheinData: body.typenscheinData || null,
      vehicleType: body.vehicleType || '',
      powerPs: body.power ? parseInt(body.power) : null,
      powerKw: body.power ? Math.round(parseInt(body.power) / 1.36) : null,
      cylinders: body.cylinders ? parseInt(body.cylinders) : null,
      displacement: body.displacement ? parseInt(body.displacement) : null,
      weightEmpty: body.weightEmpty || '',
      weightTotal: body.weightTotal || '',
      
      // COLOR FIELDS
      colorExterior: body.colorExterior || '',
      colorInterior: body.colorInterior || '',
      
      // ADDITIONAL FIELDS
      vin: body.vin || '',
      firstRegistration: body.firstRegistration || '',
      additionalFeatures: body.additionalFeatures || '',
      equipment: body.equipment || [],
      
      // WALLET FIELDS (for tracking)
      listingFeePaid: sellerData && !isFirstSixMonths ? listingFee : 0,
      paidAt: new Date(),
      transactionId: transactionLog?.id || null,
      
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('🚗 Creating car listing:', {
      listingType: carListing.listingType,
      price: carListing.price,
      startingPrice: carListing.startingPrice,
      reservePrice: carListing.reservePrice,
      auctionEnd: carListing.auctionEnd
    })

    // Save the car to storage
    const savedCar = await saveCar(carListing)

    console.log('✅ Car listing created with ID:', savedCar.id)
    
    // Return seller balance info if available
    const response: any = {
      success: true,
      message: 'Car listing created successfully',
      car: savedCar,
      listingType: listingType,
      auctionEnd: auctionEndDate
    }
    
    if (sellerData) {
      response.sellerBalance = sellerData.funds
      response.listingFee = sellerData && !isFirstSixMonths ? listingFee : 0
      response.freeListing = isFirstSixMonths
      if (transactionLog) {
        response.transaction = {
          id: transactionLog.id,
          type: transactionLog.type,
          amount: transactionLog.amount,
          newBalance: transactionLog.newBalance
        }
      }
    }

    return response

  } catch (error: any) {
    console.error('❌ Error creating car listing:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})