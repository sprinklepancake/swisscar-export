export default defineEventHandler(async (event) => {
    const { email } = await readBody(event)
    
    // Validate email
    if (!validator.isEmail(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid email format'
        })
    }
    
    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
        // Don't reveal whether user exists
        return { success: true }
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour
    
    // Update user
    await updateUser(user.id, { 
        resetToken,
        resetTokenExpiry 
    })
    
    // Send email with reset link
    await sendResetEmail(user.email, resetToken)
    
    return { success: true }
})