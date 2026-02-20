// server/api/user/request-verification.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    const supabase = getSupabaseAdmin()
    if (user.verified) return { success: true, message: 'User already verified', alreadyVerified: true }

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      type: 'verification_request',
      action: 'Verification Requested',
      description: 'User requested account verification',
      metadata: { requestedAt: new Date().toISOString() },
      ip_address: event.node.req.socket?.remoteAddress || '',
      user_agent: event.node.req.headers['user-agent'] || '',
    })

    return { success: true, message: 'Verification request sent to admin. You will be notified once reviewed.' }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to request verification' })
  }
})
