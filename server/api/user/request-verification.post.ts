// server/api/user/request-verification.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: profile } = await supabase
      .from('users')
      .select('verified')
      .eq('id', user.id)
      .single()

    if (profile?.verified) {
      return { success: true, message: 'User already verified', alreadyVerified: true }
    }

    // Log the request in activity_logs
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      type: 'verification_request',
      action: 'Verification Requested',
      description: 'User requested account verification',
      metadata: { requested_at: new Date().toISOString() },
    })

    return {
      success: true,
      message: 'Verification request sent to admin. You will be notified once reviewed.',
    }
  } catch (error: any) {
    console.error('Error requesting verification:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to request verification' })
  }
})
