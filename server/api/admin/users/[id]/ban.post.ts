// server/api/admin/users/[id]/ban.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const userId = getRouterParam(event, 'id')

  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('users')
      .update({ banned: true })
      .eq('id', userId)

    if (error) throw error

    return { success: true, message: 'User banned successfully' }
  } catch (error) {
    return { success: false, error: 'Failed to ban user' }
  }
})
