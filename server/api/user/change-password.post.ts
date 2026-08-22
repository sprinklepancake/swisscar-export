// server/api/user/change-password.post.ts
//
// Signed-in password change. Users reported that they simply could not change
// their password after signing up: there was no UI and no endpoint, only a
// forgot-password flow whose email pointed at a 404.
//
// The current password is re-checked against Supabase Auth before anything is
// changed, so a hijacked browser tab cannot silently take over the account.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAuth } from '~/server/utils/auth'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const { currentPassword, newPassword } = (await readBody(event)) || {}

  if (!currentPassword || !newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Your current password and a new password are both required.' })
  }
  if (String(newPassword).length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'The new password must be at least 8 characters.' })
  }
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'The new password must be different from your current one.' })
  }

  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw createError({ statusCode: 500, statusMessage: 'Password changes are not configured on this server.' })
  }

  // Verify the current password with a throwaway anon client so we never touch
  // the session the user is currently browsing with.
  const verifier = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const { error: signInError } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: String(currentPassword),
  })

  if (signInError) {
    throw createError({ statusCode: 400, statusMessage: 'Your current password is not correct.' })
  }

  // scope: 'local' is essential. The default is 'global', which revokes EVERY
  // refresh token for this user — it would sign them out on every device,
  // including the tab they are using right now. We only want to discard the
  // throwaway session this check just created.
  await verifier.auth.signOut({ scope: 'local' }).catch(() => {})

  const admin = getSupabaseAdmin()
  const { error: updateError } = await admin.auth.admin.updateUserById(user.authUid, {
    password: String(newPassword),
  })

  if (updateError) {
    throw createError({ statusCode: 400, statusMessage: updateError.message || 'Could not update your password.' })
  }

  // Best-effort audit trail.
  try {
    await admin.from('activity_logs').insert({
      user_id: user.id,
      type: 'password_change',
      action: 'Password Changed',
      description: 'The account password was changed from the profile page',
      metadata: { at: new Date().toISOString() },
      ip_address: getRequestIP(event, { xForwardedFor: true }) || '',
      user_agent: getHeader(event, 'user-agent') || '',
    })
  } catch { /* audit logging must never block the change */ }

  return { success: true, message: 'Your password has been changed.' }
})
