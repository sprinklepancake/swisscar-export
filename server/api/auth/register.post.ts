// server/api/auth/register.post.ts
import { validateRegisterInput } from '../../validators/auth'
import { createUser, getUserByEmail } from '../../database/repositories/userRepository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  console.log('Registration request body:', body) // Add this to see what's being sent
  
  const { 
    name, 
    email, 
    password, 
    phone, 
    role,
    companyName,
    businessType,
    canton,
    city,
    zipCode,
    country,
    taxId,
    streetAddress
  } = body
  
  // Validate input - update your validator to include phone
  const { valid, errors } = validateRegisterInput({ name, email, password, phone })
  if (!valid) {
    throw createError({
      statusCode: 400,
      statusMessage: errors.join(', ')
    })
  }
  
  // Check if user exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email already in use'
    })
  }
  
  // Create user - include ALL fields
  try {
    const user = await createUser({
      name,
      email,
      password,
      phone,
      role: role || 'buyer',
      companyName: companyName || '',
      businessType: businessType || '',
      canton: canton || '',
      city: city || '',
      zipCode: zipCode || '',
      country: country || 'Switzerland',
      taxId: taxId || '',
      streetAddress: streetAddress || ''
    })
    
    console.log('User created with location data:', {
      id: user.id,
      canton: user.canton,
      city: user.city,
      zipCode: user.zipCode,
      streetAddress: user.streetAddress
    })
    
    return { 
      success: true,
      userId: user.id
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed'
    })
  }
})