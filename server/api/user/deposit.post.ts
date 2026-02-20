// server/api/user/deposit.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { amount, paymentMethod, reference } = await readBody(event)
  const depositAmount = parseFloat(amount)

  if (isNaN(depositAmount) || depositAmount <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid amount' })
  if (depositAmount > 10000) throw createError({ statusCode: 400, statusMessage: 'Maximum single deposit is 10,000 CHF' })

  try {
    const supabase = getSupabaseAdmin()
    const { data: profile } = await supabase.from('users').select('funds').eq('id', user.id).single()
    if (!profile) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    const previousBalance = parseFloat(profile.funds || 0)
    const newBalance = previousBalance + depositAmount

    await supabase.from('users').update({ funds: newBalance }).eq('id', user.id)

    const { data: transaction } = await supabase.from('transaction_logs').insert({
      user_id: user.id,
      type: 'deposit',
      amount: depositAmount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      description: `Deposit via ${paymentMethod || 'manual'}${reference ? ` (${reference})` : ''}`,
      reference_id: `DEPOSIT-${Date.now()}-${user.id}`,
      metadata: { paymentMethod, reference },
    }).select().single()

    return {
      success: true,
      message: 'Deposit successful',
      transaction: { id: transaction?.id, amount: depositAmount, newBalance },
      user: { id: user.id, newBalance },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to process deposit' })
  }
})
