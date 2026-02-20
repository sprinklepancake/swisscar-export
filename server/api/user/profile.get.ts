// server/api/user/profile.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Please login to view your profile' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Get full profile
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Get user's cars
    const { data: cars } = await supabase
      .from('cars')
      .select('id, status, created_at')
      .eq('seller_id', user.id)

    const allCars = cars || []
    const activeListings = allCars.filter((c: any) => c.status === 'active' || c.status === 'auction').length
    const soldCars = allCars.filter((c: any) => c.status === 'sold').length

    return {
      user: {
        id: profile.id,
        auth_uid: profile.auth_uid,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        role: profile.role,
        funds: parseFloat(profile.funds || 0),
        verified: profile.verified || false,
        banned: profile.banned || false,
        company_name: profile.company_name,
        business_type: profile.business_type,
        tax_id: profile.tax_id,
        street_address: profile.street_address,
        canton: profile.canton,
        city: profile.city,
        zip_code: profile.zip_code,
        country: profile.country,
        profile_image: profile.profile_image,
        free_feature_credits: profile.free_feature_credits,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        stats: {
          totalListings: allCars.length,
          activeListings,
          soldCars,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch profile' })
  }
})
