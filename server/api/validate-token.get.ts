// server/api/validate-token.get.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) return { valid: false, user: null }
  return { valid: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
})