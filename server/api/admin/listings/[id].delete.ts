// server/api/admin/listings/[id].delete.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { releaseHeldBids } from '~/server/utils/wallet'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, message: 'Admin access required' })

  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, message: 'Invalid listing ID' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: car } = await supabase.from('cars').select('id').eq('id', listingId).single()
    if (!car) throw createError({ statusCode: 404, message: 'Listing not found' })

    // Bidders' deposits are held against this car — return them before the bid
    // rows are deleted, otherwise the money vanishes with no record.
    await releaseHeldBids(parseInt(listingId), {
      reason: 'Listing removed by an administrator — your bid was returned',
    })

    // Cascade delete in correct order
    const { data: chats } = await supabase.from('chats').select('id').eq('car_id', listingId)
    const chatIds = (chats || []).map((c: any) => c.id)
    if (chatIds.length > 0) await supabase.from('messages').delete().in('chat_id', chatIds)
    await supabase.from('chats').delete().eq('car_id', listingId)
    await supabase.from('bids').delete().eq('car_id', listingId)
    await supabase.from('watchlists').delete().eq('car_id', listingId)
    await supabase.from('cars').delete().eq('id', listingId)

    return { success: true, message: 'Listing removed successfully' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message || 'Failed to remove listing' })
  }
})
