// server/api/chat/[id]/send.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')
  if (!chatId) throw createError({ statusCode: 400, statusMessage: 'Chat ID is required' })

  const { content } = await readBody(event)
  if (!content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Message content is required' })

  try {
    const supabase = getSupabaseAdmin()

    // Verify access to this chat
    const { data: chat } = await supabase
      .from('chats')
      .select('id, buyer_id, seller_id')
      .eq('id', chatId)
      .single()

    if (!chat) throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
    if (chat.buyer_id !== user.id && chat.seller_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: parseInt(chatId),
        sender_id: user.id,
        content: content.trim(),
        read: false,
      })
      .select(`
        id, content, sender_id, read, created_at,
        sender:users!sender_id (id, name, profile_image)
      `)
      .single()

    if (error) throw error

    // Update chat's last_message_at
    await supabase
      .from('chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    return {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        senderName: message.sender?.name || user.name,
        senderImage: message.sender?.profile_image,
        createdAt: message.created_at,
        read: message.read,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to send message' })
  }
})
