// server/api/admin/listings/[id]/sold.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const listingId = getRouterParam(event, 'id')
  if (!listingId) throw createError({ statusCode: 400, statusMessage: 'Listing ID required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: car, error } = await supabase.from('cars').update({ status: 'sold' }).eq('id', listingId).select('id, make, model, status').single()
    if (error || !car) throw createError({ statusCode: 404, statusMessage: 'Listing not found' })
    return { success: true, message: `${car.make} ${car.model} marked as sold`, car }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to mark listing as sold' })
  }
})
