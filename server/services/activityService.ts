// server/services/activityService.ts - ADD THIS IMPORT AT TOP
import { User } from '~/server/database/models'

// Add this method to ActivityService:
  /**
   * Log watchlist removal
   */
  static async logWatchlistRemoved(userId: number, carId: number, carTitle: string) {
    return this.logActivity({
      userId,
      type: 'watchlist_removed',
      action: 'watchlist_item_removed',
      description: `Removed ${carTitle} from watchlist`,
      metadata: { carId, carTitle }
    })
  }