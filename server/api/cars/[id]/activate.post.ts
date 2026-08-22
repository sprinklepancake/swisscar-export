// server/api/cars/[id]/activate.post.ts
//
// Counterpart to sold.post.ts — also missing, so "Activate" 404'd.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireVerified } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Re-listing a car is a posting action, so it needs an approved account.
  const user = await requireVerified(event, 'publish listings')

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const supabase = getSupabaseAdmin()

  const { data: car } = await supabase
    .from('cars')
    .select('id, seller_id, status, listing_type, auction_end')
    .eq('id', carId)
    .single()

  if (!car) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })
  if (car.seller_id !== user.id && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'This is not your listing.' })
  }

  // An auction whose end date has passed cannot simply be switched back on.
  if (car.listing_type === 'auction' && car.auction_end && new Date(car.auction_end) < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This auction has already ended. Please create a new listing instead.',
    })
  }

  const nextStatus = car.listing_type === 'auction' ? 'auction' : 'active'

  const { error } = await supabase
    .from('cars')
    .update({ status: nextStatus })
    .eq('id', carId)

  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not update the listing' })

  return { success: true, message: 'Listing is live again', status: nextStatus }
})
