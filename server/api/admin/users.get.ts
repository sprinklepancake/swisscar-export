// server/api/admin/users.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const safeUsers = (users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      role: u.role,
      verified: u.verified,
      banned: u.banned,
      funds: parseFloat(u.funds || 0),
      company_name: u.company_name,
      business_type: u.business_type,
      canton: u.canton,
      city: u.city,
      zip_code: u.zip_code,
      country: u.country,
      profile_image: u.profile_image,
      last_login: u.last_login,
      login_count: u.login_count,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))

    return { success: true, users: safeUsers }
  } catch (error) {
    console.error('Error getting users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
})
