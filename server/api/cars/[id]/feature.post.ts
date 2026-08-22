// server/api/cars/[id]/feature.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireVerified } from '~/server/utils/auth'
import { getPlatformSettings } from '~/server/utils/settings'
import { adjustFunds, InsufficientFundsError } from '~/server/utils/wallet'

export default defineEventHandler(async (event) => {
  // Featuring spends wallet funds, so it needs the same bar as posting.
  const user = await requireVerified(event, 'feature listings')

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const { useFreeCredit = false, permanent = false } = await readBody(event)

  try {
    const supabase = getSupabaseAdmin()

    // Prices come from the admin Settings tab. /api/cars/[id]/can-feature already
    // quoted them from there while this endpoint charged its own hardcoded
    // numbers — so the price a seller was shown was not the price they paid.
    const settings = await getPlatformSettings()
    const FEATURE_PRICE = settings.featurePrice
    const FEATURE_DAYS = settings.featureDurationDays
    const PERMANENT_PRICE = settings.permanentFeaturePrice

    const [{ data: car }, { data: profile }] = await Promise.all([
      supabase.from('cars').select('id, make, model, seller_id, status, is_featured, featured_until, permanent_feature').eq('id', carId).single(),
      supabase.from('users').select('id, funds, free_feature_credits, created_at').eq('id', user.id).single(),
    ])

    if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    if (car.seller_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'You do not own this car' })
    if (car.status !== 'active' && car.status !== 'auction') {
      throw createError({ statusCode: 400, statusMessage: 'Only live listings can be featured' })
    }
    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    // A permanent feature stores featured_until = NULL, so the old guard
    // (is_featured AND featured_until in the future) never fired for it — the
    // 50 CHF permanent feature could be bought again and again.
    if (car.permanent_feature) {
      throw createError({ statusCode: 400, statusMessage: 'This car already has a permanent feature.' })
    }
    if (car.is_featured && car.featured_until && new Date(car.featured_until) > new Date()) {
      throw createError({ statusCode: 400, statusMessage: 'This car is already featured' })
    }
    if (permanent && !settings.allowPermanentFeature) {
      throw createError({ statusCode: 400, statusMessage: 'Permanent features are currently disabled.' })
    }

    const freeCredits = profile.free_feature_credits || 0
    const previousBalance = parseFloat(profile.funds || 0)
    let cost = 0
    let transactionType = 'feature_payment'
    let description = ''
    let featuredUntil: string | null = null

    if (permanent) {
      cost = PERMANENT_PRICE
      transactionType = 'permanent_feature_payment'
      description = `Permanent feature for ${car.make} ${car.model}`
      featuredUntil = null
    } else if (useFreeCredit && freeCredits > 0) {
      cost = 0
      transactionType = 'free_feature'
      description = `Free feature (credit) for ${car.make} ${car.model}`
      const until = new Date()
      until.setDate(until.getDate() + FEATURE_DAYS)
      featuredUntil = until.toISOString()
    } else {
      cost = FEATURE_PRICE
      description = `${FEATURE_DAYS}-day feature for ${car.make} ${car.model}`
      const until = new Date()
      until.setDate(until.getDate() + FEATURE_DAYS)
      featuredUntil = until.toISOString()
    }

    if (cost > 0 && previousBalance < cost) {
      throw createError({ statusCode: 402, statusMessage: `Insufficient funds. You need ${cost} CHF. Your balance is ${previousBalance} CHF.` })
    }

    // Deduct funds and update car
    let newBalance = previousBalance
    if (cost > 0) {
      try {
        const result = await adjustFunds(user.id, -cost, {
          type: transactionType,
          description,
          carId: parseInt(carId),
          referenceId: carId,
        })
        newBalance = result.newBalance
      } catch (chargeError: any) {
        if (chargeError instanceof InsufficientFundsError) {
          throw createError({
            statusCode: 402,
            statusMessage: `Insufficient funds. Featuring this listing costs ${cost} CHF.`,
          })
        }
        throw chargeError
      }
    }

    if (useFreeCredit && freeCredits > 0 && cost === 0) {
      await supabase.from('users').update({ free_feature_credits: Math.max(0, freeCredits - 1) }).eq('id', user.id)
    }

    await supabase.from('cars').update({ is_featured: true, featured_until: featuredUntil, permanent_feature: permanent }).eq('id', carId)

    const remainingCredits = (useFreeCredit && cost === 0) ? Math.max(0, freeCredits - 1) : freeCredits

    return {
      success: true, carId: parseInt(carId), featuredUntil, permanent,
      isFree: cost === 0, cost,
      durationDays: permanent ? 'permanent' : FEATURE_DAYS,
      // Was missing, so the success message interpolated "undefined".
      remainingCredits,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to feature car' })
  }
})
