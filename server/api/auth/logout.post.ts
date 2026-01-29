// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  try {
    // Clear cookies
    deleteCookie(event, 'access_token')
    deleteCookie(event, 'refresh_token')
    
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed'
    })
  }
})