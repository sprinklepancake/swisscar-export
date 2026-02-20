// server/api/cars/[id].delete.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const carId = event.context.params?.id
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: car } = await supabase.from('cars').select('id, seller_id').eq('id', carId).single()
    if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    if (car.seller_id !== user.id && user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'You can only delete your own listings' })

    // Cascade delete in order
    const { data: chats } = await supabase.from('chats').select('id').eq('car_id', carId)
    const chatIds = (chats || []).map((c: any) => c.id)
    if (chatIds.length > 0) await supabase.from('messages').delete().in('chat_id', chatIds)
    await supabase.from('chats').delete().eq('car_id', carId)
    await supabase.from('bids').delete().eq('car_id', carId)
    await supabase.from('watchlists').delete().eq('car_id', carId)
    await supabase.from('cars').delete().eq('id', carId)

    return { success: true, message: 'Listing deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to delete listing' })
  }
})
