// server/api/user/profile.put.ts
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)

  const allowed = ['name', 'phone', 'company_name', 'street_address', 'city', 'canton', 'zip_code', 'business_type']
  const updateData: any = {}
  allowed.forEach(field => {
    // Accept both snake_case and camelCase from frontend
    const camelField = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
    if (body[field] !== undefined) updateData[field] = body[field]
    else if (body[camelField] !== undefined) updateData[field] = body[camelField]
  })

  if (Object.keys(updateData).length === 0) {
    return { success: true, message: 'No changes to save' }
  }

  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) throw error

    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to update profile' })
  }
})
