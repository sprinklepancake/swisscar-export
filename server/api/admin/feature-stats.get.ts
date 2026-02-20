// server/api/admin/feature-stats.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const now = new Date().toISOString()

    const { count: activeFeatured } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)
      .eq('status', 'active')

    const { count: permanentFeatures } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)
      .eq('permanent_feature', true)
      .eq('status', 'active')

    const { count: totalListings } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: featureRevTransactions } = await supabase
      .from('transaction_logs')
      .select('amount')
      .in('type', ['feature_payment', 'permanent_feature_payment'])

    const featureRevenue = (featureRevTransactions || []).reduce(
      (sum: number, t: any) => sum + Math.abs(parseFloat(t.amount) || 0),
      0
    )

    return {
      success: true,
      stats: {
        activeFeaturedCars: activeFeatured || 0,
        permanentFeatures: permanentFeatures || 0,
        freeFeaturesUsed: 0,
        featureRevenue: Math.round(featureRevenue * 100) / 100,
        usersWithCredits: 0,
        totalListings: totalListings || 0,
        settings: { price: 5, durationDays: 7, permanentFeaturePrice: 50, allowPermanentFeature: true },
      },
    }
  } catch (error: any) {
    console.error('Feature stats error:', error)
    return {
      success: false,
      error: error.message,
      stats: { activeFeaturedCars: 0, permanentFeatures: 0, freeFeaturesUsed: 0, featureRevenue: 0, usersWithCredits: 0, totalListings: 0 },
    }
  }
})
