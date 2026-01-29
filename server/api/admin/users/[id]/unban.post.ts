// server/api/admin/users/[id]/unban.post.ts
import { getUserById, updateUser } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  try {
    const userId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid user ID'
      })
    }
    
    const user = await getUserById(userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    await updateUser(userId, { banned: false })
    
    return {
      success: true,
      message: 'User unbanned successfully'
    }
  } catch (error) {
    console.error('Error unbanning user:', error)
    return {
      success: false,
      error: 'Failed to unban user'
    }
  }
})