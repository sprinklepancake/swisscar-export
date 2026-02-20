// server/api/cars/[id]/can-feature.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) return { canFeature: false, reason: 'Not authenticated' }

  const carId = getRouterParam(event, 'id')
  if (!carId) return { canFeature: false, reason: 'Car ID required' }

  try {
    const supabase = getSupabaseAdmin()

    const [{ data: car }, { data: profile }, { data: settings }] = await Promise.all([
      supabase.from('cars').select('id, seller_id, status, is_featured, featured_until, permanent_feature').eq('id', carId).single(),
      supabase.from('users').select('id, funds, free_feature_credits, created_at').eq('id', user.id).single(),
      supabase.from('settings').select('key, value').in('key', ['featurePrice', 'featureDurationDays', 'permanentFeaturePrice', 'allowPermanentFeature']),
    ])

    if (!car) return { canFeature: false, reason: 'Car not found' }
    if (car.seller_id !== user.id) return { canFeature: false, reason: 'You do not own this listing' }
    if (car.status !== 'active') return { canFeature: false, reason: 'Only active listings can be featured' }
    if (car.is_featured && car.featured_until && new Date(car.featured_until) > new Date()) {
      return { canFeature: false, reason: 'This car is already featured' }
    }

    const map: Record<string, any> = {}
    ;(settings || []).forEach((s: any) => { map[s.key] = s.value })

    const price = parseFloat(map.featurePrice) || 5
    const durationDays = parseInt(map.featureDurationDays) || 7
    const permanentFeaturePrice = parseFloat(map.permanentFeaturePrice) || 50
    const allowPermanentFeature = map.allowPermanentFeature !== 'false'

    const freeCredits = profile?.free_feature_credits || 0
    const balance = parseFloat(profile?.funds || 0)

    // Check if in free period (first 6 months)
    const joinedDate = profile?.created_at ? new Date(profile.created_at) : null
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const inFreePeriod = joinedDate ? joinedDate > sixMonthsAgo : false

    return {
      canFeature: true,
      price,
      durationDays,
      permanentFeaturePrice,
      allowPermanentFeature,
      freeCreditsAvailable: freeCredits,
      userBalance: balance,
      hasSufficientFunds: balance >= price,
      inFreePeriod,
    }
  } catch (error: any) {
    return { canFeature: false, reason: 'Error checking feature eligibility' }
  }
})