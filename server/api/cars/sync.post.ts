// server/api/cars/sync.post.ts - FIXED VERSION
import { Car } from '~/server/database/models'
import { getAllCars } from '~/server/utils/carStorage'

export default defineEventHandler(async (event) => {
  // ADD AWAIT HERE
  const fileCars = await getAllCars()
  
  let createdCount = 0
  let updatedCount = 0
  
  for (const fileCar of fileCars) {
    // Find or create car in database
    const [dbCar, created] = await Car.findOrCreate({
      where: { id: fileCar.id },
      defaults: {
        ...fileCar,
        sellerId: fileCar.sellerId || 1 // Default seller if missing
      }
    })
    
    if (created) {
      createdCount++
    } else {
      // Update existing car
      await dbCar.update(fileCar)
      updatedCount++
    }
  }
  
  return {
    success: true,
    message: `Synced ${fileCars.length} cars (${createdCount} created, ${updatedCount} updated)`
  }
})