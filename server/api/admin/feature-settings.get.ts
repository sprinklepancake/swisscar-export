// server/api/admin/feature-settings.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

const DEFAULTS = { price: 5, durationDays: 7, permanentFeaturePrice: 50, allowPermanentFeature: true, listingsPerFreeFeature: 10 }

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['featurePrice', 'featureDurationDays', 'permanentFeaturePrice', 'allowPermanentFeature', 'listingsPerFreeFeature'])

    const map: Record<string, any> = {}
    ;(settings || []).forEach((s: any) => { map[s.key] = s.value })

    return {
      success: true,
      config: {
        price: parseFloat(map.featurePrice) || DEFAULTS.price,
        durationDays: parseInt(map.featureDurationDays) || DEFAULTS.durationDays,
        permanentFeaturePrice: parseFloat(map.permanentFeaturePrice) || DEFAULTS.permanentFeaturePrice,
        allowPermanentFeature: map.allowPermanentFeature !== undefined ? Boolean(map.allowPermanentFeature) : DEFAULTS.allowPermanentFeature,
        listingsPerFreeFeature: parseInt(map.listingsPerFreeFeature) || DEFAULTS.listingsPerFreeFeature,
      },
    }
  } catch (error: any) {
    return { success: true, config: DEFAULTS }
  }
})
