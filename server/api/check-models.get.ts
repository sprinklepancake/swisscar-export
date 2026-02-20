// server/api/check-models.get.ts
// Old file imported Sequelize models - replaced with Supabase health check
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      return { success: false, error: error.message, db: 'supabase' }
    }

    return { success: true, db: 'supabase', message: 'Supabase connection OK' }
  } catch (error: any) {
    return { success: false, error: error.message, db: 'supabase' }
  }
})