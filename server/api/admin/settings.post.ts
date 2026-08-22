// server/api/admin/settings.post.ts
//
// The admin panel has always POSTed to /api/admin/settings — but the route did
// not exist. Every "Update listing fees", "Update feature settings" and
// "Update user settings" button in the Settings tab silently 404'd, so nothing
// an administrator changed there was ever saved.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'

type Row = { key: string; value: string; description: string; category: string; data_type: string; is_public: boolean }

const num = (v: any, fallback: number) => {
  const n = parseFloat(String(v))
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = (await readBody(event)) || {}
  const rows: Row[] = []

  const push = (key: string, value: any, description: string, category: string, dataType: string) => {
    rows.push({ key, value: String(value), description, category, data_type: dataType, is_public: false })
  }

  if (body.listingFees) {
    push('normalListingFee', num(body.listingFees.normalListingFee, 7.5), 'Fee for normal car listings', 'fees', 'number')
    push('auctionListingFee', num(body.listingFees.auctionListingFee, 10), 'Fee for auction listings', 'fees', 'number')
  }

  if (body.featureSettings) {
    const f = body.featureSettings
    push('featurePrice', num(f.price, 5), 'Feature listing price', 'features', 'number')
    push('featureDurationDays', num(f.durationDays, 7), 'Feature duration in days', 'features', 'number')
    push('permanentFeaturePrice', num(f.permanentFeaturePrice, 50), 'Permanent feature price', 'features', 'number')
    push('listingsPerFreeFeature', num(f.listingsPerFreeFeature, 10), 'Listings needed per free feature', 'features', 'number')
    push('allowPermanentFeature', Boolean(f.allowPermanentFeature), 'Allow permanent features', 'features', 'boolean')
  }

  if (body.userSettings) {
    const u = body.userSettings
    push('requireIdVerification', Boolean(u.requireIdVerification), 'Require ID verification before posting, messaging and bidding', 'user', 'boolean')
    push('freeFirstSixMonths', Boolean(u.freeFirstSixMonths), 'New sellers get free listings for their first 6 months', 'user', 'boolean')
    push('autoExpireFeatures', Boolean(u.autoExpireFeatures), 'Auto-expire featured listings', 'user', 'boolean')
    push('emailNotifications', Boolean(u.emailNotifications), 'Send email notifications', 'user', 'boolean')
  }

  if (rows.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })

  if (error) {
    console.error('[admin/settings] upsert failed:', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Could not save the settings' })
  }

  return { success: true, message: 'Settings saved', updated: rows.map(r => r.key) }
})
