import { H3Event } from 'h3'
import { RateLimiterMemory } from 'rate-limiter-flexible'

const loginRateLimiter = new RateLimiterMemory({
    points: Number(process.env.LOGIN_RATE_LIMIT) || 5,
    duration: Number(process.env.LOGIN_RATE_LIMIT_WINDOW) || 15 * 60 // 15 minutes
})

export default defineEventHandler(async (event: H3Event) => {
    if (event.path === '/api/auth/login') {
        const ip = getRequestHeader(event, 'x-forwarded-for') || getRequestIP(event)
        
        try {
            await loginRateLimiter.consume(ip)
        } catch (err) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Too many login attempts. Please try again later.'
            })
        }
    }
})