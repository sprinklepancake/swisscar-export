// server/api/admin/users/[id]/unban.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, message: 'Admin access required' })
  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, message: 'Invalid user ID' })
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('users').update({ banned: false }).eq('id', userId)
  if (error) return { success: false, error: 'Failed to unban user' }
  return { success: true, message: 'User unbanned successfully' }
})
