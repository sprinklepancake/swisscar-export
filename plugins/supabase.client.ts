import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup(nuxtApp) {
    const config = useRuntimeConfig()
    const { supabaseUrl, supabaseAnonKey } = config.public

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase credentials missing! Check your .env / Render env vars.')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

    nuxtApp.provide('supabase', supabase)
    console.log('✅ Supabase client initialized')
  }
})