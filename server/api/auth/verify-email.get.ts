export default defineEventHandler(async (event) => {
    const { token } = getQuery(event)
    
    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Verification token is required'
        })
    }
    
    // Find user by token
    const user = await getUserByVerificationToken(token as string)
    if (!user) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid verification token'
        })
    }
    
    // Mark as verified
    await updateUser(user.id, { 
        verified: true,
        verificationToken: null 
    })
    
    return { success: true }
})