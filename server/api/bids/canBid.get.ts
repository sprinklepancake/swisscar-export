// server/api/bids/canBid.get.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    if (!user) {
      return { canBid: false, reason: 'not_authenticated', message: 'Please log in to place bids' }
    }

    const supabase = getSupabaseAdmin()

    const { data: profile } = await supabase
      .from('users')
      .select('id, name, role, verified, banned, funds')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { canBid: false, reason: 'user_not_found', message: 'User not found' }
    }

    if (profile.banned) {
      return { canBid: false, reason: 'banned', userBanned: true, message: 'Your account has been banned from placing bids' }
    }

    if (!profile.verified) {
      return {
        canBid: false,
        reason: 'not_verified',
        needsVerification: true,
        message: 'Only verified users can place bids. Please complete ID verification.',
      }
    }

    const funds = parseFloat(profile.funds || 0)

    return {
      canBid: true,
      user: {
        id: profile.id,
        name: profile.name,
        funds,
        verified: profile.verified,
        banned: profile.banned,
        role: profile.role,
      },
      requirements: {
        verified: true,
        notBanned: true,
        hasFunds: funds > 0,
        message: funds > 0 ? 'You can place bids' : 'Add funds to your wallet to place bids',
      },
    }
  } catch (error) {
    console.error('Error checking bid eligibility:', error)
    return { canBid: false, reason: 'error', message: 'Error checking bid eligibility' }
  }
})
