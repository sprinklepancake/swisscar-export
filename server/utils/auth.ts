// server/utils/auth.ts
import { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  return user
}
