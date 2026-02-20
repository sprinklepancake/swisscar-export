// server/api/chat/[id].get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const chatId = getRouterParam(event, 'id')
  if (!chatId) throw createError({ statusCode: 400, statusMessage: 'Chat ID is required' })

  try {
    const supabase = getSupabaseAdmin()

    // Get chat with full details
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select(`
        id, car_id, buyer_id, seller_id, last_message_at, created_at,
        buyer:users!buyer_id (id, name, email, profile_image, phone),
        seller:users!seller_id (id, name, email, profile_image, phone),
        car:cars!car_id (
          id, make, model, year, price, mileage, images, city, canton, status,
          listing_type, fuel_type, transmission, color_exterior, condition,
          engine_size, with_warranty, valid_inspection, has_accident, export_documents
        )
      `)
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
    }

    // Verify access
    if (chat.buyer_id !== user.id && chat.seller_id !== user.id) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        id, content, sender_id, read, created_at, updated_at,
        sender:users!sender_id (id, name, profile_image)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)
      .eq('read', false)

    const isCurrentUserSeller = chat.seller_id === user.id
    const otherUser = isCurrentUserSeller ? chat.buyer : chat.seller

    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'User',
      senderImage: msg.sender?.profile_image,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      read: msg.read,
    }))

    return {
      chat: {
        id: chat.id,
        carId: chat.car_id,
        buyerId: chat.buyer_id,
        sellerId: chat.seller_id,
        buyer: chat.buyer,
        seller: chat.seller,
        car: chat.car,
        isCurrentUserSeller,
        otherUser,
      },
      messages: formattedMessages,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch chat' })
  }
})
