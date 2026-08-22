// server/api/contact/reveal.post.ts
//
// The car detail page has always called this route when a buyer reveals a
// seller's phone number — but the file did not exist, so every reveal produced
// a 404 in the console and the view was never recorded.
//
// It is deliberately forgiving: a failure here must never stop a buyer from
// seeing a phone number that is meant to be public.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user || null
  const { carId, sellerId } = (await readBody(event).catch(() => ({}))) || {}

  if (!carId) {
    throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('activity_logs').insert({
      user_id: user?.id || null,
      type: 'contact_reveal',
      action: 'Contact Revealed',
      description: user
        ? `${user.name} viewed the seller contact details for listing #${carId}`
        : `A visitor viewed the seller contact details for listing #${carId}`,
      metadata: { carId, sellerId: sellerId || null, at: new Date().toISOString() },
      ip_address: getRequestIP(event, { xForwardedFor: true }) || '',
      user_agent: getHeader(event, 'user-agent') || '',
    })
  } catch (error: any) {
    // Logging is best-effort. Never block the reveal on it.
    console.warn('[contact/reveal] could not record the view:', error?.message || error)
  }

  return { success: true }
})
