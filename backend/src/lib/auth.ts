import jwt from 'jsonwebtoken'
import { env } from '../env'

const TOKEN_EXPIRATION = '7d'

export function signToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: TOKEN_EXPIRATION })
}

export function getUserIdFromAuthHeader(header?: string): string | null {
  if (!header?.startsWith('Bearer ')) return null

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET)
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
