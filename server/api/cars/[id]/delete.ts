// server/api/cars/[id]/delete.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'You must be logged in to delete listings' })
  }

  const carId = getRouterParam(event, 'id')
  if (!carId) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Find the car
    const { data: car, error: fetchError } = await supabase
      .from('cars')
      .select('id, seller_id')
      .eq('id', carId)
      .single()

    if (fetchError || !car) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    }

    // Check ownership
    if (car.seller_id !== user.id && user.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'You can only delete your own listings' })
    }

    // Delete in order: bids, watchlists, messages (via chats), chats, then car
    await supabase.from('bids').delete().eq('car_id', carId)
    await supabase.from('watchlists').delete().eq('car_id', carId)

    const { data: chats } = await supabase
      .from('chats')
      .select('id')
      .eq('car_id', carId)

    if (chats && chats.length > 0) {
      const chatIds = chats.map((c: any) => c.id)
      await supabase.from('messages').delete().in('chat_id', chatIds)
      await supabase.from('chats').delete().eq('car_id', carId)
    }

    const { error: deleteError } = await supabase.from('cars').delete().eq('id', carId)
    if (deleteError) throw deleteError

    return { success: true, message: 'Listing deleted successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete listing' })
  }
})
