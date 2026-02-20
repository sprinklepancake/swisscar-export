// server/api/cars/[id]/feature.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

const FEATURE_PRICE = 5
const FEATURE_DAYS = 7
const PERMANENT_PRICE = 50

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const carId = getRouterParam(event, 'id')
  if (!carId) throw createError({ statusCode: 400, statusMessage: 'Car ID is required' })

  const { useFreeCredit = false, permanent = false } = await readBody(event)

  try {
    const supabase = getSupabaseAdmin()

    const [{ data: car }, { data: profile }] = await Promise.all([
      supabase.from('cars').select('id, make, model, seller_id, status, is_featured, featured_until, permanent_feature').eq('id', carId).single(),
      supabase.from('users').select('id, funds, free_feature_credits, created_at').eq('id', user.id).single(),
    ])

    if (!car) throw createError({ statusCode: 404, statusMessage: 'Car not found' })
    if (car.seller_id !== user.id) throw createError({ statusCode: 403, statusMessage: 'You do not own this car' })
    if (car.status !== 'active') throw createError({ statusCode: 400, statusMessage: 'Only active listings can be featured' })
    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    // Check if already featured
    if (car.is_featured && car.featured_until && new Date(car.featured_until) > new Date()) {
      throw createError({ statusCode: 400, statusMessage: 'This car is already featured' })
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
    const newBalance = previousBalance - cost
    if (cost > 0) {
      await supabase.from('users').update({ funds: newBalance }).eq('id', user.id)
      await supabase.from('transaction_logs').insert({
        user_id: user.id, type: transactionType, amount: -cost,
        previous_balance: previousBalance, new_balance: newBalance, description,
        car_id: parseInt(carId),
      })
    }

    if (useFreeCredit && freeCredits > 0 && cost === 0) {
      await supabase.from('users').update({ free_feature_credits: Math.max(0, freeCredits - 1) }).eq('id', user.id)
    }

    await supabase.from('cars').update({ is_featured: true, featured_until: featuredUntil, permanent_feature: permanent }).eq('id', carId)

    return { success: true, carId: parseInt(carId), featuredUntil, permanent, isFree: cost === 0, cost, durationDays: permanent ? 'permanent' : FEATURE_DAYS }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || 'Failed to feature car' })
  }
})
