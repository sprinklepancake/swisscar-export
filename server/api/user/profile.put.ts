// server/api/user/profile.put.ts - NEW FILE
import { User } from '~/server/database/models'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user || event.context.auth
    
    if (!user || !user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const body = await readBody(event)
    
    // Allowed fields for update
    const allowedFields = [
      'name',
      'phone',
      'companyName',
      'streetAddress',
      'city',
      'canton',
      'zipCode',
      'businessType'
    ]
    
    // Filter only allowed fields
    const updateData: any = {}
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Update user in database
    await User.update(updateData, {
      where: { id: user.id }
    })

    return {
      success: true,
      message: 'Profile updated successfully'
    }
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    })
  }
})