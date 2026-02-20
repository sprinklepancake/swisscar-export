// server/utils/supabase.ts
// Server-side Supabase client using service role key (bypasses RLS - for server use only)
import { createClient } from '@supabase/supabase-js'

let _supabase: ReturnType<typeof createClient> | null = null

export const getSupabaseAdmin = () => {
  if (_supabase) return _supabase

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  }

  _supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _supabase
}

// Verify a user's Supabase JWT and return the user
export const verifySupabaseToken = async (token: string) => {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

// Get user profile from our users table by auth_uid
export const getUserProfile = async (authUid: string) => {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', authUid)
    .single()

  if (error || !data) return null
  return data
}

export const supabase = getSupabaseAdmin
