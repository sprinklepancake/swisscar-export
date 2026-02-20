// server/api/cron/check-expired-featured.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    // Find featured cars whose featuredUntil has passed (and are not permanent)
    const { data: expired, error } = await supabase
      .from('cars')
      .select('id, make, model')
      .eq('is_featured', true)
      .eq('permanent_feature', false)
      .lt('featured_until', now)

    if (error) throw error

    if (!expired || expired.length === 0) {
      return { success: true, expiredCount: 0, message: 'No expired featured listings' }
    }

    const expiredIds = expired.map((c: any) => c.id)

    await supabase
      .from('cars')
      .update({ is_featured: false, featured_until: null })
      .in('id', expiredIds)

    console.log(`⏰ Removed featured status from ${expired.length} expired listings`)

    return {
      success: true,
      expiredCount: expired.length,
      message: `Removed featured status from ${expired.length} expired listings`,
      cars: expired.map((c: any) => ({ id: c.id, name: `${c.make} ${c.model}` })),
    }
  } catch (error: any) {
    console.error('Cron check-expired-featured error:', error)
    return { success: false, error: error.message }
  }
})