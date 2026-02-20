// server/api/admin/settings.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()

    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw error

    // Group by category
    const byCategory: Record<string, any[]> = {}
    ;(settings || []).forEach((s: any) => {
      const cat = s.category || 'general'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push({ key: s.key, value: s.value, description: s.description, dataType: s.data_type, isPublic: s.is_public })
    })

    return { success: true, settings: byCategory, allSettings: settings || [] }
  } catch (error: any) {
    console.error('Settings error:', error)
    return { success: false, error: 'Failed to fetch settings', settings: {} }
  }
})
