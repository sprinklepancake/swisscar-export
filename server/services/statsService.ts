// server/services/statsService.ts - UPDATED
import { User, Car, Bid } from '~/server/database/models'
import { WatchlistService } from './watchlistService'
import { Op } from 'sequelize'
import { sequelize } from '~/server/database/models' // ADD THIS IMPORT

export class StatsService {
  /**
   * Get user statistics
   */
  static async getUserStats(userId: number, userRole: string) {
    try {
      if (userRole === 'seller') {
        return await this.getSellerStats(userId)
      } else {
        return await this.getBuyerStats(userId)
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return this.getDefaultStats()
    }
  }

  /**
   * Get seller statistics
   */
  private static async getSellerStats(userId: number) {
    const [
      carsSold,
      activeListings,
      totalRevenue
    ] = await Promise.all([
      // Cars sold (status = 'sold' and sellerId = userId)
      Car.count({
        where: {
          sellerId: userId,
          status: 'sold'
        }
      }),

      // Active listings (status = 'active' and sellerId = userId)
      Car.count({
        where: {
          sellerId: userId,
          status: 'active'
        }
      }),

      // Total revenue from sold cars
      Car.sum('price', {
        where: {
          sellerId: userId,
          status: 'sold'
        }
      })
    ])

    // Get total views on seller's cars
    const totalViews = await this.getTotalCarViews(userId)

    return {
      carsSold: carsSold || 0,
      carsBought: 0,
      activeListings: activeListings || 0,
      watchlistCount: 0, // Sellers don't have watchlist
      totalRevenue: totalRevenue || 0,
      totalViews: totalViews || 0,
      averagePrice: carsSold > 0 ? Math.round((totalRevenue || 0) / carsSold) : 0
    }
  }

  /**
   * Get buyer statistics
   */
  private static async getBuyerStats(userId: number) {
    const [
      carsBought,
      activeBids,
      watchlistCount
    ] = await Promise.all([
      // Cars bought (status = 'sold' and highest bid by this user)
      this.getCarsBoughtByUser(userId),

      // Active bids (bids on active listings)
      Bid.count({
        where: {
          userId: userId,
          status: 'active'
        },
        include: [{
          model: Car,
          as: 'car',
          where: {
            status: 'active'
          }
        }]
      }),

      // Watchlist count - USE REAL DATA
      WatchlistService.getWatchlistCount(userId)
    ])

    return {
      carsSold: 0,
      carsBought: carsBought || 0,
      activeListings: 0,
      watchlistCount: watchlistCount || 0,
      totalSpent: await this.getTotalSpentByUser(userId),
      averageBid: await this.getAverageBidByUser(userId)
    }
  }

  /**
   * Get number of cars bought by user
   */
  private static async getCarsBoughtByUser(userId: number): Promise<number> {
    try {
      // Find cars where user has winning bid
      const winningBids = await Bid.findAll({
        where: {
          userId: userId,
          isWinningBid: true,
          status: 'won'
        },
        include: [{
          model: Car,
          as: 'car',
          where: {
            status: 'sold'
          }
        }]
      })

      return winningBids.length
    } catch (error) {
      console.error('Error getting cars bought:', error)
      return 0
    }
  }

  /**
   * Get total spent by user
   */
  private static async getTotalSpentByUser(userId: number): Promise<number> {
    try {
      const result = await Bid.findOne({
        where: {
          userId: userId,
          isWinningBid: true,
          status: 'won'
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalSpent']
        ],
        raw: true
      })

      return result?.totalSpent ? parseFloat(result.totalSpent) : 0
    } catch (error) {
      console.error('Error getting total spent:', error)
      return 0
    }
  }

  /**
   * Get average bid by user
   */
  private static async getAverageBidByUser(userId: number): Promise<number> {
    try {
      const result = await Bid.findOne({
        where: { userId: userId },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('amount')), 'avgBid']
        ],
        raw: true
      })

      return result?.avgBid ? Math.round(parseFloat(result.avgBid)) : 0
    } catch (error) {
      console.error('Error getting average bid:', error)
      return 0
    }
  }

  /**
   * Get total views on seller's cars
   */
  private static async getTotalCarViews(sellerId: number): Promise<number> {
    try {
      const result = await Car.findOne({
        where: { sellerId: sellerId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('views')), 'totalViews']
        ],
        raw: true
      })

      return result?.totalViews ? parseInt(result.totalViews) : 0
    } catch (error) {
      console.error('Error getting total views:', error)
      return 0
    }
  }

  /**
   * Get default stats (fallback)
   */
  private static getDefaultStats() {
    return {
      carsSold: 0,
      carsBought: 0,
      activeListings: 0,
      watchlistCount: 0,
      totalRevenue: 0,
      totalSpent: 0,
      totalViews: 0,
      averagePrice: 0,
      averageBid: 0
    }
  }

  /**
   * Get platform-wide statistics (for admin dashboard)
   */
  static async getPlatformStats() {
    try {
      const [
        totalUsers,
        totalCars,
        activeListings,
        soldCars,
        totalRevenue,
        averageCarPrice
      ] = await Promise.all([
        User.count(),
        Car.count(),
        Car.count({ where: { status: 'active' } }),
        Car.count({ where: { status: 'sold' } }),
        Car.sum('price', { where: { status: 'sold' } }),
        Car.findOne({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
          ],
          where: { status: 'sold' },
          raw: true
        })
      ])

      // Get total watchlist items
      const totalWatchlistItems = await Watchlist.count()

      return {
        totalUsers: totalUsers || 0,
        totalCars: totalCars || 0,
        activeListings: activeListings || 0,
        soldCars: soldCars || 0,
        totalRevenue: totalRevenue || 0,
        totalWatchlistItems: totalWatchlistItems || 0,
        averageCarPrice: averageCarPrice ? Math.round(parseFloat(averageCarPrice.avgPrice)) : 0,
        conversionRate: totalCars > 0 ? Math.round((soldCars / totalCars) * 100) : 0
      }
    } catch (error) {
      console.error('Error getting platform stats:', error)
      return this.getDefaultPlatformStats()
    }
  }

  private static getDefaultPlatformStats() {
    return {
      totalUsers: 0,
      totalCars: 0,
      activeListings: 0,
      soldCars: 0,
      totalRevenue: 0,
      totalWatchlistItems: 0,
      averageCarPrice: 0,
      conversionRate: 0
    }
  }
}