// server/api/chat/index.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    return { success: false, message: 'Unauthorized', chats: [] }
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id, car_id, buyer_id, seller_id, last_message_at, created_at,
        buyer:users!buyer_id (id, name, email),
        seller:users!seller_id (id, name, email),
        car:cars!car_id (id, make, model, year, price, images, city, canton)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    const chatIds = (chats || []).map((c: any) => c.id)

    // Get last message per chat
    const lastMessages: Record<number, any> = {}
    if (chatIds.length > 0) {
      for (const chatId of chatIds) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, content, sender_id, created_at')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (msgs && msgs.length > 0) lastMessages[chatId] = msgs[0]
      }
    }

    // Get unread counts
    const unreadMap: Record<number, number> = {}
    if (chatIds.length > 0) {
      const { data: unread } = await supabase
        .from('messages')
        .select('chat_id')
        .in('chat_id', chatIds)
        .neq('sender_id', user.id)
        .eq('read', false)

      ;(unread || []).forEach((m: any) => {
        unreadMap[m.chat_id] = (unreadMap[m.chat_id] || 0) + 1
      })
    }

    const formattedChats = (chats || []).map((chat: any) => {
      const isCurrentUserSeller = chat.seller_id === user.id
      const otherUser = isCurrentUserSeller ? chat.buyer : chat.seller
      const lastMsg = lastMessages[chat.id]

      return {
        id: chat.id,
        carId: chat.car_id,
        sellerId: chat.seller_id,
        buyerId: chat.buyer_id,
        otherUserId: otherUser?.id,
        otherUserName: otherUser?.name || 'User',
        otherUserEmail: otherUser?.email,
        carInfo: chat.car ? `${chat.car.make} ${chat.car.model}` : 'Car',
        car: chat.car || null,
        lastMessage: lastMsg
          ? { id: lastMsg.id, content: lastMsg.content, senderId: lastMsg.sender_id, createdAt: lastMsg.created_at }
          : null,
        unreadCount: unreadMap[chat.id] || 0,
        lastMessageAt: chat.last_message_at,
        createdAt: chat.created_at,
      }
    })

    return { success: true, chats: formattedChats }
  } catch (error: any) {
    console.error('Error fetching chats:', error)
    return { success: false, message: error.message || 'Failed to fetch chats', chats: [] }
  }
})
