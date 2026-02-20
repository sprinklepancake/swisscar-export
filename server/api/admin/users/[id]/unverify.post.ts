// server/api/admin/users/[id]/unverify.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, message: 'Admin access required' })
  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, message: 'Invalid user ID' })
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('users').update({ verified: false }).eq('id', userId)
  if (error) return { success: false, error: 'Failed to unverify user' }
  return { success: true, message: 'User unverified successfully' }
})
