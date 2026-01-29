import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.split(' ')[1]
  
  if (!token) {
    throw createError({ statusCode: 401 })
  }

  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtAccessSecret)
    
    // Fetch user from DB
    const user = await getUserById(decoded.userId)
    
    return { 
      valid: true,
      user: {
        id: user.id,
        banned: user.banned
      }
    }
  } catch (error) {
    throw createError({ statusCode: 401 })
  }
})