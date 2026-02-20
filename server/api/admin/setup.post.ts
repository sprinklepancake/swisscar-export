// server/api/admin/setup.post.ts
// One-time setup to promote a user to admin role
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const { email, setupKey } = await readBody(event)

  // Basic protection - require a setup key set in env
  const config = useRuntimeConfig()
  if (config.adminSetupKey && setupKey !== config.adminSetupKey) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid setup key' })
  }

  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase.from('users').update({ role: 'admin' }).eq('email', email).select('id, name, email, role').single()

    if (error || !user) throw createError({ statusCode: 404, statusMessage: 'User not found with that email' })

    return { success: true, message: `${user.name} (${user.email}) is now an admin`, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Setup failed' })
  }
})
