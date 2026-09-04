// server/api/admin/users/[id]/unverify-auction.post.ts
//
// Revokes auction access. The account keeps working normally — it just cannot
// bid any more.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, 'id')
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Invalid user ID' })

  const supabase = getSupabaseAdmin()

  // buyer_type goes back to 'direct' in the SAME update, and this is the whole
  // point of the endpoint working correctly:
  //
  //   * The pending queue is (buyer_type = 'auction' AND id_document_url), so
  //     leaving buyer_type = 'auction' would put the account straight back into
  //     the admin's own queue, forever, indistinguishable from a real request.
  //   * pages/profile.vue derives "waiting for approval" from the same pair, so
  //     the revoked user would sit in front of an amber card promising that an
  //     administrator was reviewing their document — with the re-request button
  //     hidden in exactly that state. A dead end built out of a lie.
  //
  // The document itself is deliberately KEPT: the admin has already reviewed it,
  // and the user can ask again without re-uploading.
  const { error } = await supabase
    .from('users')
    .update({ verified_buyer: false, buyer_type: 'direct' })
    .eq('id', userId)

  if (error) return { success: false, error: 'Failed to revoke auction access' }
  return { success: true, message: 'Auction access revoked' }
})
