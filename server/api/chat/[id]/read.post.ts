// server/api/chat/[id]/read.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const chatId = getRouterParam(event, 'id')
  if (!chatId) throw createError({ statusCode: 400, statusMessage: 'Chat ID required' })

  const supabase = getSupabaseAdmin()

  // Verify user has access
  const { data: chat } = await supabase.from('chats').select('buyer_id, seller_id').eq('id', chatId).single()
  if (!chat || (chat.buyer_id !== user.id && chat.seller_id !== user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  await supabase.from('messages').update({ read: true }).eq('chat_id', chatId).neq('sender_id', user.id).eq('read', false)

  return { success: true }
})
