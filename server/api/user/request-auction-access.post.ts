// server/api/user/request-auction-access.post.ts
//
// A direct buyer or a seller asking to be let into auctions. Signing up needs
// no ID at all; this is where one becomes necessary, because bidding commits
// money and carries the no-show ban.
//
// The document itself is uploaded separately (/api/user/upload-id) — this route
// only flips the account into the auction queue and pings the administrators.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAuth } from '~/server/utils/auth'
import { notifyAdminInBackground } from '~/server/utils/notify'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { data: profile } = await supabase
    .from('users')
    .select('id, name, email, role, verified_buyer, buyer_type, id_document_url')
    .eq('id', user.id)
    .single()

  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Profile not found' })

  if (profile.verified_buyer) {
    return { success: true, alreadyApproved: true, message: 'Your account is already approved for auctions.' }
  }

  if (!profile.id_document_url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please upload your ID document first — an administrator needs it to approve auction access.',
    })
  }

  const alreadyQueued = profile.buyer_type === 'auction'

  if (!alreadyQueued) {
    const { error } = await supabase.from('users').update({ buyer_type: 'auction' }).eq('id', user.id)
    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Could not submit your request. Please try again.' })
    }
  }

  const siteUrl = String(useRuntimeConfig().public.siteUrl || '').replace(/\/$/, '')
  notifyAdminInBackground({
    type: 'auction_access_requested',
    userId: profile.id,
    subject: `Auction access requested: ${profile.name}`,
    body: [
      `${profile.name} (${profile.email}) has asked for auction access and uploaded an ID document.`,
      ``,
      `Role: ${profile.role}`,
      ``,
      `Open the admin panel, view the ID, then press "Approve auctions" to let them bid.`,
      ``,
      `Admin panel: ${siteUrl}/en/admin`,
    ].join('\n'),
    metadata: { email: profile.email, role: profile.role, resubmitted: alreadyQueued },
  })

  return {
    success: true,
    message: 'Request sent. An administrator will review your ID document, usually within 24 hours.',
  }
})
