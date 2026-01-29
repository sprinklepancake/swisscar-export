import jwt from 'jsonwebtoken'
const config = useRuntimeConfig()

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  )
  
  return { accessToken, refreshToken }
}

export const verifyToken = (token: string, type: 'access' | 'refresh') => {
  const secret = type === 'access' 
    ? config.jwtAccessSecret 
    : config.jwtRefreshSecret
    
  return jwt.verify(token, secret)
}