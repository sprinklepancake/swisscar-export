// server/api/cars/[id].ts - FIXED VERSION
import { getCarById } from '~/server/utils/carStorage'
import { getUserByEmail } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Car ID is required'
    })
  }

  // ADD AWAIT HERE
  const car = await getCarById(id)
  
  if (!car) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Car not found'
    })
  }
  
  // Try to find seller by email if sellerId is missing
  let sellerId = car.sellerId
  
  if (!sellerId && car.sellerEmail) {
    console.log('🔍 Car missing sellerId, looking up by email:', car.sellerEmail)
    try {
      const seller = await getUserByEmail(car.sellerEmail)
      
      if (seller && seller.id) {
        sellerId = seller.id
        console.log('✅ Found seller by email:', {
          id: sellerId,
          name: seller.name,
          email: seller.email
        })
        
        // Auto-update the car with sellerId - ONLY if we have a valid sellerId
        if (sellerId) {
          setTimeout(async () => {
            try {
              await $fetch(`/api/cars/${id}/update-seller`, {
                method: 'POST',
                body: { sellerId: sellerId }
              })
              console.log('✅ Auto-updated car with seller ID:', sellerId)
            } catch (updateError: any) {
              console.log('⚠️ Could not auto-update car:', updateError.message)
            }
          }, 100)
        }
      } else {
        console.log('❌ No seller found or seller has no ID for email:', car.sellerEmail)
      }
    } catch (error) {
      console.error('Error finding seller:', error)
    }
  }
  
  // Return car with updated sellerId
  return {
    ...car.toJSON ? car.toJSON() : car,
    sellerId: sellerId || null
  }
})