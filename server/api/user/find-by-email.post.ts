// server/api/users/find-by-email.post.ts - CREATE/UPDATE THIS FILE
import { getUserByEmail } from '~/server/database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body
  
  console.log('🔍 Finding user by email:', email)
  
  if (!email) {
    console.log('❌ Email is required')
    return {
      found: false,
      message: 'Email is required'
    }
  }
  
  try {
    const user = await getUserByEmail(email)
    
    console.log('🔍 User lookup result:', user ? 'Found' : 'Not found')
    
    if (!user) {
      console.log('❌ User not found with email:', email)
      return {
        found: false,
        message: 'User not found with this email',
        email: email
      }
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email
    })
    
    return {
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    console.error('❌ Error finding user by email:', error)
    return {
      found: false,
      message: 'Failed to find user',
      error: error.message
    }
  }
})