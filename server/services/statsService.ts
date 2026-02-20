// server/services/statsService.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export class StatsService {
  static async getUserStats(userId: number, userRole: string) {
    try {
      if (userRole === 'seller') return await this.getSellerStats(userId)
      return await this.getBuyerStats(userId)
    } catch (error) {
      console.error('Error getting user stats:', error)
      return this.getDefaultStats()
    }
  }

  private static async getSellerStats(userId: number) {
    const supabase = getSupabaseAdmin()
    const [{ count: carsSold }, { count: activeListings }] = await Promise.all([
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'sold'),
      supabase.from('cars').select('*', { count: 'exact', head: true }).eq('seller_id', userId).eq('status', 'active'),
    ])
    const { data: soldCars } = await supabase.from('cars').select('price').eq('seller_id', userId).eq('status', 'sold')
    const totalRevenue = (soldCars || []).reduce((sum: number, c: any) => sum + (parseFloat(c.price) || 0), 0)
    return { carsSold: carsSold || 0, carsBought: 0, activeListings: activeListings || 0, watchlistCount: 0, totalRevenue, totalViews: 0, averagePrice: carsSold ? Math.round(totalRevenue / (carsSold || 1)) : 0 }
  }

  private static async getBuyerStats(userId: number) {
    const supabase = getSupabaseAdmin()
    const [{ count: watchlistCount }, { count: activeBids }] = await Promise.all([
      supabase.from('watchlists').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('bids').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'pending'),
    ])
    return { carsSold: 0, carsBought: 0, activeListings: 0, watchlistCount: watchlistCount || 0, activeBids: activeBids || 0, totalSpent: 0 }
  }

  private static getDefaultStats() {
    return { carsSold: 0, carsBought: 0, activeListings: 0, watchlistCount: 0, totalRevenue: 0 }
  }
}
