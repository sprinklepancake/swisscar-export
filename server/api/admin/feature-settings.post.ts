// server/api/admin/feature-settings.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody(event)

  try {
    const supabase = getSupabaseAdmin()

    const upserts = [
      { key: 'featurePrice', value: String(body.price ?? 5), description: 'Feature listing price', category: 'features', data_type: 'number', is_public: false },
      { key: 'featureDurationDays', value: String(body.durationDays ?? 7), description: 'Feature duration in days', category: 'features', data_type: 'number', is_public: false },
      { key: 'permanentFeaturePrice', value: String(body.permanentFeaturePrice ?? 50), description: 'Permanent feature price', category: 'features', data_type: 'number', is_public: false },
      { key: 'allowPermanentFeature', value: String(body.allowPermanentFeature ?? true), description: 'Allow permanent features', category: 'features', data_type: 'boolean', is_public: false },
    ]

    for (const setting of upserts) {
      await supabase.from('settings').upsert(setting, { onConflict: 'key' })
    }

    return { success: true, message: 'Feature settings updated successfully' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update feature settings' })
  }
})
