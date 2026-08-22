// server/api/admin/settings.get.ts
//
// This used to return the settings grouped by their database CATEGORY
// (general / pricing / features / user), but the admin page reads
// settings.listingFees.normalListingFee, settings.featureSettings.price and
// settings.userSettings.* — so every field in the Settings tab silently fell
// back to its hardcoded default and the admin never saw the real values.
import { requireAdmin } from '~/server/utils/auth'
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { getPlatformSettings } from '~/server/utils/settings'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const s = await getPlatformSettings()

    // Kept for anything that still wants the raw rows.
    const supabase = getSupabaseAdmin()
    const { data: allSettings } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })

    return {
      success: true,
      settings: {
        listingFees: {
          normalListingFee: s.normalListingFee,
          auctionListingFee: s.auctionListingFee,
        },
        featureSettings: {
          price: s.featurePrice,
          durationDays: s.featureDurationDays,
          permanentFeaturePrice: s.permanentFeaturePrice,
          allowPermanentFeature: s.allowPermanentFeature,
          listingsPerFreeFeature: s.listingsPerFreeFeature,
        },
        userSettings: {
          requireIdVerification: s.requireIdVerification,
          freeFirstSixMonths: s.freeFirstSixMonths,
          autoExpireFeatures: s.autoExpireFeatures,
          emailNotifications: s.emailNotifications,
        },
      },
      allSettings: allSettings || [],
    }
  } catch (error: any) {
    console.error('Settings error:', error)
    return { success: false, error: 'Failed to fetch settings', settings: {} }
  }
})
