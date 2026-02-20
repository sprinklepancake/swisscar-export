// server/api/auth/register.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, phone, role, companyName, businessType, canton, city, zipCode, country, taxId, streetAddress } = body

  if (!name || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and password are required' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
      }
      throw createError({ statusCode: 400, statusMessage: authError.message })
    }

    const authUser = authData.user
    if (!authUser) throw createError({ statusCode: 500, statusMessage: 'Failed to create auth user' })

    // Create profile in users table
    const { data: profile, error: profileError } = await supabase.from('users').insert({
      auth_uid: authUser.id,
      email,
      name,
      phone: phone || '',
      role: role || 'buyer',
      company_name: companyName || '',
      business_type: businessType || '',
      canton: canton || '',
      city: city || '',
      zip_code: zipCode || '',
      country: country || 'Switzerland',
      tax_id: taxId || '',
      street_address: streetAddress || '',
      funds: 0,
      verified: false,
      banned: false,
    }).select('id').single()

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.id)
      throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
    }

    return { success: true, userId: profile.id }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Registration failed' })
  }
})
