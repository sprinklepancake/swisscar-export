// server/api/chat/start.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { carId, sellerEmail } = await readBody(event)
  if (!carId || !sellerEmail) throw createError({ statusCode: 400, statusMessage: 'Car ID and seller email are required' })

  try {
    const supabase = getSupabaseAdmin()

    const { data: seller } = await supabase.from('users').select('id').eq('email', sellerEmail).single()
    if (!seller) throw createError({ statusCode: 404, statusMessage: 'Seller not found. The seller may not have an account yet.' })
    if (user.id === seller.id) throw createError({ statusCode: 400, statusMessage: 'You cannot message yourself' })

    // Find existing chat
    const { data: existing } = await supabase.from('chats').select('id').eq('car_id', carId).eq('seller_id', seller.id).eq('buyer_id', user.id).maybeSingle()
    if (existing) return { success: true, chatId: existing.id }

    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({ car_id: parseInt(carId), seller_id: seller.id, buyer_id: user.id, last_message_at: new Date().toISOString() })
      .select('id').single()

    if (error) throw error
    return { success: true, chatId: newChat.id, message: 'Chat started successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to start chat' })
  }
})
