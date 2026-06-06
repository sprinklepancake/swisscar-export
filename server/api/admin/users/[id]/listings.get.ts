// server/api/admin/users/[id]/listings.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, title, description, make, model, year, price, status, listing_type, is_featured, created_at')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      listings: (cars || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        make: c.make,
        model: c.model,
        year: c.year,
        price: c.price,
        status: c.status || 'active',
        type: c.listing_type || 'normal',
        listingType: c.listing_type,
        isFeatured: c.is_featured,
        createdAt: c.created_at,
      })),
    }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch user listings' })
  }
})
