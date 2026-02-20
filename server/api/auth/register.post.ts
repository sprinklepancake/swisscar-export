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

  const supabase = getSupabaseAdmin()
  let authUserId: string | null = null

  try {
    // Step 1: Create auth user
    console.log('[register] Creating auth user for:', email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('[register] Auth error:', authError)
      const msg = authError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate')) {
        throw createError({ statusCode: 400, statusMessage: 'Email already in use' })
      }
      throw createError({ statusCode: 400, statusMessage: authError.message })
    }

    if (!authData.user) throw createError({ statusCode: 500, statusMessage: 'Failed to create auth user' })
    authUserId = authData.user.id
    console.log('[register] Auth user created:', authUserId)

    // Step 2: Check if profile already exists (e.g. created by a DB trigger)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('auth_uid', authUserId)
      .maybeSingle()

    if (existing) {
      // Profile already created by trigger — just update the fields
      console.log('[register] Profile already exists (trigger), updating:', existing.id)
      await supabase.from('users').update({
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
      }).eq('id', existing.id)

      return { success: true, userId: existing.id }
    }

    // Step 3: Insert profile row
    console.log('[register] Inserting profile row...')
    const { data: profile, error: profileError } = await supabase.from('users').insert({
      auth_uid: authUserId,
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
      console.error('[register] Profile insert error:', profileError)
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authUserId)
      throw createError({ statusCode: 500, statusMessage: 'Registration failed: ' + profileError.message })
    }

    console.log('[register] Profile created:', profile.id)
    return { success: true, userId: profile.id }

  } catch (error: any) {
    console.error('[register] Unhandled error:', error)

    // Rollback auth user if something went wrong after creation
    if (authUserId && !error.statusCode) {
      await supabase.auth.admin.deleteUser(authUserId).catch(() => {})
    }

    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Registration failed' })
  }
})