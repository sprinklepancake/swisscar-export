// server/api/debug.get.ts
export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const cookie = getCookie(event, 'access_token')
  
  return {
    contextKeys: Object.keys(event.context),
    user: event.context.user,
    auth: event.context.auth,
    hasUser: !!event.context.user,
    hasAuth: !!event.context.auth,
    hasAccessToken: !!cookie,
    authHeader: headers.authorization,
    path: event.path
  }
})