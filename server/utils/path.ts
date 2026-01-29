// server/utils/path.ts
export const normalizeApiPath = (path: string): { path: string; locale: string } => {
  // Remove language prefix from API paths
  const match = path.match(/^\/([a-z]{2,3})\/api\/(.+)/)
  
  if (match) {
    const [, locale, apiPath] = match
    return {
      path: `/api/${apiPath}`,
      locale
    }
  }
  
  // Check if it's already a standard API path
  if (path.startsWith('/api/')) {
    return {
      path,
      locale: 'en' // default
    }
  }
  
  // Not an API path
  return {
    path,
    locale: 'en'
  }
}

export const getCurrentLocale = (path: string): string => {
  const match = path.match(/^\/([a-z]{2,3})(\/|$)/)
  return match ? match[1] : 'en'
}