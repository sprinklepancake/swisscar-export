// server/utils/settings.ts
//
// The admin panel has a Settings tab for listing fees, feature prices and the
// free-first-six-months rule — but the endpoints that actually CHARGE people
// had those numbers hardcoded, so nothing an administrator typed there had any
// effect. Worse, /api/cars/[id]/can-feature quoted a price from settings while
// /api/cars/[id]/feature charged a different hardcoded one.
//
// One reader, used by every endpoint that quotes or charges.
import { getSupabaseAdmin } from '~/server/utils/supabase'

export const SETTING_DEFAULTS = {
  normalListingFee: 7.5,
  auctionListingFee: 10,
  featurePrice: 5,
  featureDurationDays: 7,
  permanentFeaturePrice: 50,
  allowPermanentFeature: true,
  listingsPerFreeFeature: 10,
  requireIdVerification: true,
  freeFirstSixMonths: true,
  autoExpireFeatures: true,
  emailNotifications: true,
}

export type PlatformSettings = typeof SETTING_DEFAULTS

const KEYS = Object.keys(SETTING_DEFAULTS)

const asNumber = (raw: any, fallback: number) => {
  const n = parseFloat(String(raw))
  return Number.isFinite(n) ? n : fallback
}

// settings.value is TEXT, so booleans arrive as the strings "true" / "false".
const asBoolean = (raw: any, fallback: boolean) => {
  if (raw === undefined || raw === null || raw === '') return fallback
  const v = String(raw).toLowerCase()
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return fallback
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase.from('settings').select('key, value').in('key', KEYS)

    const map: Record<string, any> = {}
    ;(data || []).forEach((row: any) => { map[row.key] = row.value })

    return {
      normalListingFee: asNumber(map.normalListingFee, SETTING_DEFAULTS.normalListingFee),
      auctionListingFee: asNumber(map.auctionListingFee, SETTING_DEFAULTS.auctionListingFee),
      featurePrice: asNumber(map.featurePrice, SETTING_DEFAULTS.featurePrice),
      featureDurationDays: asNumber(map.featureDurationDays, SETTING_DEFAULTS.featureDurationDays),
      permanentFeaturePrice: asNumber(map.permanentFeaturePrice, SETTING_DEFAULTS.permanentFeaturePrice),
      allowPermanentFeature: asBoolean(map.allowPermanentFeature, SETTING_DEFAULTS.allowPermanentFeature),
      listingsPerFreeFeature: asNumber(map.listingsPerFreeFeature, SETTING_DEFAULTS.listingsPerFreeFeature),
      requireIdVerification: asBoolean(map.requireIdVerification, SETTING_DEFAULTS.requireIdVerification),
      freeFirstSixMonths: asBoolean(map.freeFirstSixMonths, SETTING_DEFAULTS.freeFirstSixMonths),
      autoExpireFeatures: asBoolean(map.autoExpireFeatures, SETTING_DEFAULTS.autoExpireFeatures),
      emailNotifications: asBoolean(map.emailNotifications, SETTING_DEFAULTS.emailNotifications),
    }
  } catch (error: any) {
    console.error('[settings] falling back to defaults:', error?.message || error)
    return { ...SETTING_DEFAULTS }
  }
}
