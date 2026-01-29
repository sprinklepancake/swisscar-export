// server/api/stats.get.ts
import { Car, User } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Get counts from database
    const [totalCars, totalUsers, totalSellers] = await Promise.all([
      Car.count({ where: { status: 'active' } }),
      User.count(),
      User.count({ where: { role: 'seller' } })
    ])
    
    // Get unique countries/cantons (you can add this logic later)
    const countriesServed = 50 // Hardcode for now until you have actual data
    
    return {
      totalCars,
      totalUsers,
      totalSellers,
      countriesServed,
      // Add more stats as needed
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalCars: 0,
      totalUsers: 0,
      totalSellers: 0,
      countriesServed: 0
    }
  }
})