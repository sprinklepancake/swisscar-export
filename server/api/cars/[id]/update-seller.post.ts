// server/api/cars/[id]/update-seller.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const body = await readBody(event)
  const { sellerEmail, sellerId } = body

  try {
    const supabase = getSupabaseAdmin()
    let resolvedSellerId = sellerId

    if (!resolvedSellerId && sellerEmail) {
      const { data: seller } = await supabase.from('users').select('id').eq('email', sellerEmail).single()
      if (!seller) throw createError({ statusCode: 404, statusMessage: 'Seller not found with email: ' + sellerEmail })
      resolvedSellerId = seller.id
    }

    if (!resolvedSellerId) throw createError({ statusCode: 400, statusMessage: 'Seller ID or email is required' })

    const { data: car, error } = await supabase.from('cars').update({ seller_id: resolvedSellerId }).eq('id', carId).select('id, seller_id').single()
    if (error || !car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })

    return { success: true, message: 'Car updated with seller ID', car: { id: car.id, sellerId: car.seller_id } }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to update car: ' + error.message })
  }
})
