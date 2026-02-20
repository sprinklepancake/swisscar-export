// server/services/activityService.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export class ActivityService {
  static async logActivity({ userId, type, action, description, metadata = {} }: {
    userId: number, type: string, action: string, description: string, metadata?: any
  }) {
    try {
      const supabase = getSupabaseAdmin()
      await supabase.from('activity_logs').insert({ user_id: userId, type, action, description, metadata })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  static async logWatchlistAdded(userId: number, carId: number, carTitle: string) {
    return this.logActivity({ userId, type: 'watchlist_added', action: 'watchlist_item_added', description: `Added ${carTitle} to watchlist`, metadata: { carId, carTitle } })
  }

  static async logWatchlistRemoved(userId: number, carId: number, carTitle: string) {
    return this.logActivity({ userId, type: 'watchlist_removed', action: 'watchlist_item_removed', description: `Removed ${carTitle} from watchlist`, metadata: { carId, carTitle } })
  }

  static async getRecentActivity(userId: number, limit = 10) {
    try {
      const supabase = getSupabaseAdmin()
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      return (data || []).map((a: any) => ({ id: a.id, message: a.description, date: a.created_at, type: a.type }))
    } catch { return [] }
  }
}
