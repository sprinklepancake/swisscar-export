import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'

const config = useRuntimeConfig()

export default defineEventHandler(async (event: H3Event) => {
    const refreshToken = getCookie(event, 'refresh_token')
    
    if (!refreshToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Refresh token is missing'
        })
    }

    try {
        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, role: decoded.role },
            config.jwtAccessSecret,
            { expiresIn: '15m' }
        )

        setCookie(event, 'access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 900 // 15 minutes
        })

        return { success: true }
    } catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid refresh token'
        })
    }
})