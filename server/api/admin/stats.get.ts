// server/api/admin/stats.get.ts
import { getAllUsers } from '~/server/database/repositories/userRepository'
import { Car } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    // Get all users
    const users = await getAllUsers()
    
    // Get all cars
    const cars = await Car.findAll({
      where: { status: 'active' }
    }).catch(() => [])
    
    // Count users by type
    const buyers = users.filter(user => user.getDataValue('role') === 'buyer')
    const sellers = users.filter(user => user.getDataValue('role') === 'seller')
    const admins = users.filter(user => user.getDataValue('role') === 'admin')
    
    // CHANGED: Count ALL unverified users (not just buyers)
    const unverifiedUsers = users.filter(u => !u.getDataValue('verified')).length
    
    // Today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate today's revenue
    const todaysRevenue = 0 // TODO: Implement
    
    return {
      success: true,
      stats: {
        totalUsers: users.length,
        totalBuyers: buyers.length,
        totalSellers: sellers.length,
        totalAdmins: admins.length,
        activeListings: cars.length,
        unverifiedUsers: unverifiedUsers, // CHANGED: Now shows ALL unverified users
        todaysRevenue: todaysRevenue,
        bannedUsers: users.filter(u => u.getDataValue('banned')).length
      }
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      success: false,
      error: 'Failed to fetch stats',
      stats: {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        activeListings: 0,
        unverifiedUsers: 0,
        todaysRevenue: 0,
        bannedUsers: 0
      }
    }
  }
})