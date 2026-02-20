// server/api/chat/send.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { chatId, content } = await readBody(event)
  if (!chatId || !content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Chat ID and content are required' })

  const supabase = getSupabaseAdmin()

  const { data: chat } = await supabase.from('chats').select('buyer_id, seller_id').eq('id', chatId).single()
  if (!chat || (chat.buyer_id !== user.id && chat.seller_id !== user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ chat_id: parseInt(chatId), sender_id: user.id, content: content.trim(), read: false })
    .select('id, content, sender_id, read, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to send message' })

  await supabase.from('chats').update({ last_message_at: new Date().toISOString() }).eq('id', chatId)

  return { success: true, message: { id: message.id, content: message.content, senderId: message.sender_id, createdAt: message.created_at, read: message.read } }
})
