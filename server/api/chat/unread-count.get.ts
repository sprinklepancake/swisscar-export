// server/api/chat/unread-count.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) return { count: 0 }

  try {
    const supabase = getSupabaseAdmin()

    // Get all chats the user is part of
    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

    if (!chats || chats.length === 0) return { count: 0 }

    const chatIds = chats.map((c: any) => c.id)

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_id', chatIds)
      .neq('sender_id', user.id)
      .eq('read', false)

    return { count: count || 0 }
  } catch {
    return { count: 0 }
  }
})
