// server/api/chat/send.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireVerified } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // This route was the hole in the messaging gate: /api/chat/[id]/send checked
  // `verified` but this one only checked that you were logged in, so an
  // unapproved account could keep talking in any chat it was part of.
  const user = await requireVerified(event, 'send messages')

  const { chatId, content } = await readBody(event)
  if (!chatId || !content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Chat ID and content are required' })

  const supabase = getSupabaseAdmin()

  const { data: chat } = await supabase.from('chats').select('buyer_id, seller_id').eq('id', chatId).single()
  if (!chat || (chat.buyer_id !== user.id && chat.seller_id !== user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ chat_id: parseInt(chatId), sender_id: user.id, content: content.trim().slice(0, 4000), read: false })
    .select('id, content, sender_id, read, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to send message' })

  await supabase.from('chats').update({ last_message_at: new Date().toISOString() }).eq('id', chatId)

  return { success: true, message: { id: message.id, content: message.content, senderId: message.sender_id, createdAt: message.created_at, read: message.read } }
})
