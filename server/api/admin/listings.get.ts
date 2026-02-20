// server/api/admin/listings.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        id, make, model, year, price, listing_type, status, seller_id, created_at, updated_at,
        seller:users!seller_id (name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const listings = (cars || []).map((c: any) => ({
      id: c.id,
      title: `${c.make} ${c.model} ${c.year || ''}`.trim(),
      price: c.price,
      type: c.listing_type,
      status: c.status || 'active',
      seller_id: c.seller_id,
      seller_name: c.seller?.name || 'Unknown',
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))

    return { success: true, listings }
  } catch (error) {
    console.error('Error getting listings:', error)
    return { success: false, error: 'Failed to fetch listings' }
  }
})
