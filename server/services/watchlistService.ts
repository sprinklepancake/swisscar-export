// server/services/watchlistService.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export class WatchlistService {
  static async addToWatchlist(userId: number, carId: number, priceAlert?: number, notes?: string) {
    const supabase = getSupabaseAdmin()
    const { data: car } = await supabase.from('cars').select('id, make, model').eq('id', carId).single()
    if (!car) throw new Error('Car not found')

    const { data: existing } = await supabase.from('watchlists').select('id').eq('user_id', userId).eq('car_id', carId).single().catch(() => ({ data: null }))
    if (existing) throw new Error('Car is already in your watchlist')

    const { data, error } = await supabase.from('watchlists').insert({ user_id: userId, car_id: carId, price_alert: priceAlert || null, notes: notes || null }).select().single()
    if (error) throw error
    return { success: true, watchlistItem: data }
  }

  static async removeFromWatchlist(userId: number, carId: number) {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('watchlists').delete().eq('user_id', userId).eq('car_id', carId)
    if (error) throw error
    return { success: true }
  }

  static async getUserWatchlist(userId: number) {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('watchlists')
      .select(`id, car_id, price_alert, notes, created_at, car:cars!car_id(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return []
    return (data || []).filter((item: any) => item.car && item.car.status === 'active').map((item: any) => ({
      id: item.id, carId: item.car_id, car: item.car, priceAlert: item.price_alert, notes: item.notes, addedAt: item.created_at
    }))
  }

  static async isInWatchlist(userId: number, carId: number): Promise<boolean> {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('watchlists').select('id').eq('user_id', userId).eq('car_id', carId).single().catch(() => ({ data: null }))
    return !!data
  }

  static async getWatchlistCount(userId: number): Promise<number> {
    const supabase = getSupabaseAdmin()
    const { count } = await supabase.from('watchlists').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    return count || 0
  }
}
