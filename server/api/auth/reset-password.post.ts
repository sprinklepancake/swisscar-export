export default defineEventHandler(async (event) => {
    const { token, newPassword } = await readBody(event)
    
    // Validate password
    if (!validator.isLength(newPassword, { min: 8 })) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Password must be at least 8 characters'
        })
    }
    
    // Find user by token
    const user = await getUserByResetToken(token)
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid or expired token'
        })
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    
    // Update user
    await updateUser(user.id, { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null 
    })
    
    return { success: true }
})