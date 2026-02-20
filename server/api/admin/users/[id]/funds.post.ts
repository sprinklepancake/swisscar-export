// server/api/admin/users/[id]/funds.post.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = event.context.user

  if (!admin || admin.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const userId = getRouterParam(event, 'id')
  const { amount } = await readBody(event)

  if (!userId || amount === undefined || isNaN(parseFloat(amount))) {
    throw createError({ statusCode: 400, statusMessage: 'User ID and valid amount are required' })
  }

  const newBalance = parseFloat(amount)

  try {
    const supabase = getSupabaseAdmin()

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('id, name, funds')
      .eq('id', userId)
      .single()

    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    const previousBalance = parseFloat(user.funds || 0)
    const difference = newBalance - previousBalance
    const transactionType = difference >= 0 ? 'deposit' : 'withdrawal'

    // Update funds
    const { error } = await supabase
      .from('users')
      .update({ funds: newBalance })
      .eq('id', userId)

    if (error) throw error

    // Log transaction
    const { data: transaction } = await supabase
      .from('transaction_logs')
      .insert({
        user_id: parseInt(userId),
        admin_id: admin.id,
        type: transactionType,
        amount: difference,
        previous_balance: previousBalance,
        new_balance: newBalance,
        description: `Admin ${admin.name} adjusted funds`,
      })
      .select()
      .single()

    return {
      success: true,
      message: 'Funds updated successfully',
      newBalance,
      transaction: { id: transaction?.id, type: transactionType, amount: difference, previousBalance, newBalance },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Failed to update funds' })
  }
})
