// server/plugins/database.ts
// Replaces the old SQLite/Sequelize plugin.
// Just verifies Supabase is reachable on startup.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineNitroPlugin(async () => {
  console.log('🔧 Supabase plugin: Checking connection...')

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      console.error('❌ Supabase connection check failed:', error.message)
    } else {
      console.log('✅ Supabase connected successfully')
    }
  } catch (error: any) {
    console.error('❌ Supabase plugin error:', error.message)
  }
})
