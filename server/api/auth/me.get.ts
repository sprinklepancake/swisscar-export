// server/api/auth/me.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // server/middleware/auth.ts already resolved the caller from EITHER the
  // Authorization header or the cookie. Reading the cookie again here meant a
  // request that carried only a Bearer token (which is what apiFetch sends when
  // the cookie holds a token that has just expired) came back as logged out.
  const ctxUser = event.context.user
  const token = ctxUser
    ? null
    : (getCookie(event, 'sb-access-token') || getCookie(event, 'access_token'))

  if (!ctxUser && !token) return { user: null }

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('users')
      .select('id, email, name, role, funds, verified, verified_buyer, buyer_type, id_document_url, banned, phone, company_name, business_type, canton, city, zip_code, country, tax_id, street_address, profile_image, created_at, free_feature_credits')

    if (ctxUser) {
      query = query.eq('id', ctxUser.id)
    } else {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token as string)
      if (error || !authUser) return { user: null }
      query = query.eq('auth_uid', authUser.id)
    }

    const { data: profile } = await query.single()

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
        // Auction access — the only capability that still needs an ID check.
        verifiedBuyer: profile.verified_buyer || false,
        buyerType: profile.buyer_type === 'auction' ? 'auction' : 'direct',
        hasIdDocument: !!profile.id_document_url,
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
