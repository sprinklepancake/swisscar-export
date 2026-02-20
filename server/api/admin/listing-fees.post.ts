// server/api/admin/listing-fees.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user || user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })

  const body = await readBody(event)
  const normalFee = parseFloat(body.normalListingFee)
  const auctionFee = parseFloat(body.auctionListingFee)

  if (isNaN(normalFee) || isNaN(auctionFee) || normalFee < 0 || auctionFee < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Valid fee amounts are required' })
  }

  try {
    const supabase = getSupabaseAdmin()

    await supabase.from('settings').upsert([
      { key: 'normalListingFee', value: String(normalFee), description: 'Fee for normal car listings', category: 'fees', data_type: 'number', is_public: false },
      { key: 'auctionListingFee', value: String(auctionFee), description: 'Fee for auction listings', category: 'fees', data_type: 'number', is_public: false },
    ], { onConflict: 'key' })

    return { success: true, message: 'Listing fees updated successfully', fees: { normalListingFee: normalFee, auctionListingFee: auctionFee } }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update listing fees' })
  }
})
