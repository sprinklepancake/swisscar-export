// server/api/admin/user-settings.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody(event)
  const { requireIdVerification, freeFirstSixMonths, autoExpireFeatures, emailNotifications } = body

  try {
    const supabase = getSupabaseAdmin()
    const settings = [
      { key: 'requireIdVerification', value: String(Boolean(requireIdVerification)), description: 'Require ID verification for bidding/selling', category: 'user', data_type: 'boolean', is_public: false },
      { key: 'freeFirstSixMonths', value: String(Boolean(freeFirstSixMonths)), description: 'New sellers get free listings for first 6 months', category: 'user', data_type: 'boolean', is_public: false },
      { key: 'autoExpireFeatures', value: String(Boolean(autoExpireFeatures)), description: 'Auto-expire featured listings', category: 'user', data_type: 'boolean', is_public: false },
      { key: 'emailNotifications', value: String(Boolean(emailNotifications)), description: 'Send email notifications', category: 'user', data_type: 'boolean', is_public: false },
    ]
    await supabase.from('settings').upsert(settings, { onConflict: 'key' })
    return { success: true, message: 'User settings updated successfully' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update settings' })
  }
})
