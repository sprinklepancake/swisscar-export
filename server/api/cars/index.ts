// server/api/cars/index.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = getSupabaseAdmin()

    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        seller:users!seller_id (
          id, name, email, phone, company_name
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    return cars || []
  } catch (error: any) {
    console.error('Error fetching cars:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch cars' })
  }
})
