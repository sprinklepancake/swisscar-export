// server/api/user/find-by-email.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  if (!email) return { found: false, message: 'Email is required' }

  try {
    const supabase = getSupabaseAdmin()
    const { data: user } = await supabase.from('users').select('id, name, email, role').eq('email', email).single()
    if (!user) return { found: false, message: 'User not found', email }
    return { found: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  } catch {
    return { found: false, message: 'User not found', email }
  }
})
