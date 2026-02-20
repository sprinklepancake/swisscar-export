// server/api/chat/[carId]/[sellerId].get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const carId = getRouterParam(event, 'carId')
  const sellerId = getRouterParam(event, 'sellerId')
  if (!carId || !sellerId) throw createError({ statusCode: 400, statusMessage: 'Missing carId or sellerId' })

  const supabase = getSupabaseAdmin()

  const [{ data: car }, { data: seller }] = await Promise.all([
    supabase.from('cars').select('id, make, model').eq('id', carId).single(),
    supabase.from('users').select('id, name, email').eq('id', sellerId).single(),
  ])

  if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
  if (!seller) throw createError({ statusCode: 404, statusMessage: 'Seller not found' })

  // Find or create chat
  let { data: chat } = await supabase.from('chats').select('id, buyer_id, seller_id, car_id, last_message_at').eq('car_id', carId).eq('seller_id', sellerId).eq('buyer_id', user.id).maybeSingle()

  if (!chat) {
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ car_id: parseInt(carId), seller_id: parseInt(sellerId), buyer_id: user.id, last_message_at: new Date().toISOString() })
      .select('id, buyer_id, seller_id, car_id, last_message_at').single()
    if (error) throw createError({ statusCode: 500, statusMessage: 'Failed to create chat' })
    chat = newChat
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, read, created_at, sender:users!sender_id(id, name, email)')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true })

  return {
    chat: { id: chat.id, buyerId: chat.buyer_id, sellerId: chat.seller_id, carId: chat.car_id, lastMessageAt: chat.last_message_at },
    messages: (messages || []).map((m: any) => ({ id: m.id, content: m.content, senderId: m.sender_id, senderName: m.sender?.name || 'User', read: m.read, createdAt: m.created_at })),
  }
})
