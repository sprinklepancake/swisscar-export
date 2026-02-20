// server/api/test-chat.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabaseAdmin()
    const [{ count: users }, { count: cars }, { count: chats }, { count: messages }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('cars').select('*', { count: 'exact', head: true }),
      supabase.from('chats').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])

    return {
      success: true,
      db: 'supabase',
      counts: { users, cars, chats, messages },
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
