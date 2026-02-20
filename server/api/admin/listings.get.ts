// server/api/admin/listings.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, make, model, year, price, status, listing_type, is_featured, created_at, seller_id, seller:users!seller_id(id, name, email)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      listings: (cars || []).map((c: any) => ({
        id: c.id, make: c.make, model: c.model, year: c.year, price: c.price,
        status: c.status || 'active', type: c.listing_type || 'normal',
        listingType: c.listing_type, isFeatured: c.is_featured,
        sellerId: c.seller_id, sellerName: c.seller?.name || 'Unknown',
        sellerEmail: c.seller?.email || '', createdAt: c.created_at,
      })),
    }
  } catch {
    return { success: false, error: 'Failed to fetch listings' }
  }
})
