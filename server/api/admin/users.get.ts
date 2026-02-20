// server/api/admin/users.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user
  if (!admin || admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, phone, role, verified, banned, funds, company_name, business_type, canton, city, zip_code, country, profile_image, created_at, updated_at, free_feature_credits')
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      users: (users || []).map((u: any) => ({
        id: u.id, email: u.email, name: u.name, phone: u.phone || '',
        role: u.role, verified: u.verified || false, banned: u.banned || false,
        funds: parseFloat(u.funds || 0), companyName: u.company_name || '',
        businessType: u.business_type || '', canton: u.canton || '',
        city: u.city || '', zipCode: u.zip_code || '', country: u.country || '',
        profileImage: u.profile_image || '', freeFeatureCredits: u.free_feature_credits || 0,
        createdAt: u.created_at, updatedAt: u.updated_at,
      })),
    }
  } catch (error: any) {
    return { success: false, error: 'Failed to fetch users' }
  }
})
