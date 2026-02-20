// server/api/cars/[id].ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: car, error } = await supabase
      .from('cars')
      .select(`
        *,
        seller:users!seller_id (
          id, name, email, phone, company_name
        )
      `)
      .eq('id', id)
      .single()

    if (error || !car) {
      throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    }

    return car
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch car' })
  }
})
