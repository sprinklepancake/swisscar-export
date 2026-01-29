// server/services/watchlistService.ts
import { Watchlist, Car } from '~/server/database/models'
import { ActivityService } from './activityService'

export class WatchlistService {
  /**
   * Add car to user's watchlist
   */
  static async addToWatchlist(userId: number, carId: number, priceAlert?: number, notes?: string) {
    try {
      // Check if car exists
      const car = await Car.findByPk(carId)
      if (!car) {
        throw new Error('Car not found')
      }

      // Check if already in watchlist
      const existing = await Watchlist.findOne({
        where: { userId, carId }
      })

      if (existing) {
        throw new Error('Car is already in your watchlist')
      }

      // Add to watchlist
      const watchlistItem = await Watchlist.create({
        userId,
        carId,
        priceAlert: priceAlert || null,
        notes: notes || null
      })

      // Log activity
      await ActivityService.logWatchlistAdded(userId, carId, car.getDataValue('make') + ' ' + car.getDataValue('model'))

      return {
        success: true,
        watchlistItem
      }
    } catch (error: any) {
      console.error('Error adding to watchlist:', error)
      throw error
    }
  }

  /**
   * Remove car from user's watchlist
   */
  static async removeFromWatchlist(userId: number, carId: number) {
    try {
      const result = await Watchlist.destroy({
        where: { userId, carId }
      })

      if (result === 0) {
        throw new Error('Car not found in watchlist')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error removing from watchlist:', error)
      throw error
    }
  }

  /**
   * Get user's watchlist
   */
  static async getUserWatchlist(userId: number) {
    try {
      const watchlistItems = await Watchlist.findAll({
        where: { userId },
        include: [{
          model: Car,
          as: 'car',
          where: { status: 'active' } // Only show active cars
        }],
        order: [['createdAt', 'DESC']]
      })

      return watchlistItems.map(item => ({
        id: item.getDataValue('id'),
        carId: item.getDataValue('carId'),
        car: item.getDataValue('car'),
        priceAlert: item.getDataValue('priceAlert'),
        notes: item.getDataValue('notes'),
        addedAt: item.getDataValue('createdAt')
      }))
    } catch (error) {
      console.error('Error getting watchlist:', error)
      return []
    }
  }

  /**
   * Check if car is in user's watchlist
   */
  static async isInWatchlist(userId: number, carId: number): Promise<boolean> {
    try {
      const item = await Watchlist.findOne({
        where: { userId, carId }
      })
      return !!item
    } catch (error) {
      console.error('Error checking watchlist:', error)
      return false
    }
  }

  /**
   * Get watchlist count for user
   */
  static async getWatchlistCount(userId: number): Promise<number> {
    try {
      return await Watchlist.count({
        where: { userId },
        include: [{
          model: Car,
          as: 'car',
          where: { status: 'active' }
        }]
      })
    } catch (error) {
      console.error('Error getting watchlist count:', error)
      return 0
    }
  }

  /**
   * Update watchlist item
   */
  static async updateWatchlistItem(userId: number, carId: number, updates: { priceAlert?: number; notes?: string }) {
    try {
      const item = await Watchlist.findOne({
        where: { userId, carId }
      })

      if (!item) {
        throw new Error('Watchlist item not found')
      }

      await item.update(updates)
      return { success: true, item }
    } catch (error: any) {
      console.error('Error updating watchlist:', error)
      throw error
    }
  }

  /**
   * Get users who have a car in their watchlist (for sellers)
   */
  static async getCarWatchlistUsers(carId: number) {
    try {
      const items = await Watchlist.findAll({
        where: { carId },
        include: [{
          model: User,
          as: 'user'
        }]
      })

      return items.map(item => ({
        userId: item.getDataValue('userId'),
        user: item.getDataValue('user'),
        hasPriceAlert: !!item.getDataValue('priceAlert'),
        priceAlert: item.getDataValue('priceAlert')
      }))
    } catch (error) {
      console.error('Error getting car watchlist users:', error)
      return []
    }
  }
}