// server/utils/carStorage.ts - MUST BE THIS DATABASE VERSION
import { Car } from '~/server/database/models/Car'
import { User } from '~/server/database/models/User'

// ADD THIS FUNCTION
export const deleteCar = async (carId: number | string): Promise<boolean> => {
  try {
    const id = typeof carId === 'string' ? parseInt(carId) : carId
    console.log('🗑️ DATABASE: Deleting car ID:', id)
    
    // Find the car first (optional - for logging)
    const car = await Car.findByPk(id)
    if (!car) {
      console.log('❌ DATABASE: Car not found for deletion:', id)
      return false
    }
    
    console.log('🗑️ DATABASE: Deleting car:', {
      id: car.id,
      make: car.make,
      model: car.model,
      sellerEmail: car.sellerEmail
    })
    
    // Delete the car from database
    const result = await Car.destroy({
      where: { id: id }
    })
    
    if (result === 1) {
      console.log('✅ DATABASE: Car deleted successfully:', id)
      return true
    } else {
      console.log('❌ DATABASE: Car not deleted (result = 0):', id)
      return false
    }
    
  } catch (error) {
    console.error('❌ DATABASE ERROR deleting car:', error)
    throw error
  }
}

export const getCarById = async (id: string | number) => {
  try {
    const carId = typeof id === 'string' ? parseInt(id) : id
    console.log('🔍 DATABASE QUERY: Looking for car ID:', carId)
    
    const car = await Car.findByPk(carId, {
      include: [
        { 
          model: User, 
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'companyName']
        }
      ]
    })
    
    if (car) {
      console.log('✅ DATABASE: Found car', car.id, car.make, car.model)
    } else {
      console.log('❌ DATABASE: Car not found:', carId)
    }
    
    return car
  } catch (error) {
    console.error('❌ DATABASE ERROR getting car:', error)
    return null
  }
}

export const getAllCars = async () => {
  try {
    console.log('📊 DATABASE: Getting all cars...')
    const cars = await Car.findAll({
      where: { status: 'active' },
      include: [
        { 
          model: User, 
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'companyName']
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    console.log(`📊 DATABASE: Found ${cars.length} cars`)
    return cars
  } catch (error) {
    console.error('❌ DATABASE ERROR getting all cars:', error)
    return []
  }
}

export const saveCar = async (carData: any) => {
  try {
    console.log('🚗 DATABASE: Saving new car...', {
      make: carData.make,
      model: carData.model,
      sellerEmail: carData.sellerEmail
    })
    
    // Remove id if present - database will auto-generate
    const dataToSave = { ...carData }
    delete dataToSave.id
    
    // Save to database
    const car = await Car.create(dataToSave)
    
    console.log('✅ DATABASE: Car saved with ID:', car.id)
    
    // Return with seller relationship
    return await Car.findByPk(car.id, {
      include: [
        { 
          model: User, 
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'companyName']
        }
      ]
    })
  } catch (error: any) {
    console.error('❌ DATABASE ERROR saving car:', error.message)
    console.error('Full error:', error)
    throw error
  }
}

export const getNextId = () => {
  console.warn('⚠️ getNextId() is deprecated - database auto-increments')
  return Math.floor(Math.random() * 1000) + 100 // Placeholder
}

export const updateCar = async (carId: string | number, updates: any) => {
  try {
    const id = typeof carId === 'string' ? parseInt(carId) : carId
    const car = await Car.findByPk(id)
    
    if (!car) {
      console.error('❌ Car not found for update:', id)
      return null
    }
    
    await car.update(updates)
    console.log('✅ DATABASE: Car updated:', id)
    
    return await Car.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'companyName']
        }
      ]
    })
  } catch (error) {
    console.error('❌ DATABASE ERROR updating car:', error)
    return null
  }
}

export const fixCarSellerIds = async () => {
  console.log('⚠️ fixCarSellerIds() not needed with database')
  return 0
}