// server/api/admin/users/[id]/verify-auction.post.ts
//
// Grants auction access: the admin has looked at the account's ID document and
// is satisfied. This is separate from /verify — an account is usable without it,
// it only unlocks bidding.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const supabase = getSupabaseAdmin()

  const { data: target } = await supabase
    .from('users')
    .select('id, id_document_url')
    .eq('id', userId)
    .maybeSingle()

  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  // Approving an account with no document on file is almost always a misclick,
  // and it would quietly defeat the one rule auctions depend on.
  if (!target.id_document_url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This account has no ID document on file, so it cannot be approved for auctions. Ask the user to upload one from their profile page first.',
    })
  }

  const { error } = await supabase
    .from('users')
    // Approving for auctions also records that this is an auction account, so
    // the admin filter and the profile page agree with each other.
    .update({ verified_buyer: true, buyer_type: 'auction' })
    .eq('id', userId)

  if (error) return { success: false, error: 'Failed to approve auction access' }
  return { success: true, message: 'Auction access approved' }
})
