// server/api/admin/setup.post.ts
// One-time bootstrap: creates a brand-new admin user (Supabase Auth + users table).
// Blocked once any admin already exists.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event)

  if (!email || !password || !name) {
    throw createError({ statusCode: 400, statusMessage: 'email, password and name are required' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  try {
    const supabase = getSupabaseAdmin()

    // Block if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (checkError) throw createError({ statusCode: 500, statusMessage: 'Database error checking admins' })

    if (existingAdmins && existingAdmins.length > 0) {
      throw createError({ statusCode: 403, statusMessage: 'An admin account already exists. Use the admin panel to manage roles.' })
    }

    // Create the Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation for admin bootstrap
      user_metadata: { name, role: 'admin' },
    })

    if (authError || !authData.user) {
      throw createError({ statusCode: 500, statusMessage: authError?.message || 'Failed to create auth user' })
    }

    // Create the users table record
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role: 'admin',
        auth_uid: authData.user.id,
        verified: true,
        banned: false,
        funds: 0,
        free_feature_credits: 0,
      })
      .select('id, name, email, role')
      .single()

    if (profileError || !profile) {
      // Clean up the auth user if profile insert failed
      await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {})
      throw createError({ statusCode: 500, statusMessage: profileError?.message || 'Failed to create user profile' })
    }

    return {
      success: true,
      message: `Admin account created for ${profile.name} (${profile.email})`,
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Setup failed' })
  }
})