// server/api/auth/me.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'sb-access-token') || getCookie(event, 'access_token')
  if (!token) return { user: null }

  try {
    const supabase = getSupabaseAdmin()
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)
    if (error || !authUser) return { user: null }

    const { data: profile } = await supabase
      .from('users')
      .select('id, email, name, role, funds, verified, banned, phone, company_name, business_type, canton, city, zip_code, country, tax_id, street_address, profile_image, created_at, free_feature_credits')
      .eq('auth_uid', authUser.id)
      .single()

    if (!profile) return { user: null }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        phone: profile.phone || '',
        funds: parseFloat(profile.funds || 0),
        verified: profile.verified || false,
        banned: profile.banned || false,
        companyName: profile.company_name || '',
        businessType: profile.business_type || '',
        canton: profile.canton || '',
        city: profile.city || '',
        zipCode: profile.zip_code || '',
        country: profile.country || 'Switzerland',
        taxId: profile.tax_id || '',
        streetAddress: profile.street_address || '',
        profileImage: profile.profile_image || '',
        freeFeatureCredits: profile.free_feature_credits || 0,
        createdAt: profile.created_at,
      }
    }
  } catch {
    return { user: null }
  }
})
