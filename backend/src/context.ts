import type { Request } from 'express'
import { getUserIdFromAuthHeader } from './lib/auth'
import { unauthenticated } from './lib/errors'

export interface Context {
  userId: string | null
}

export async function buildContext({ req }: { req: Request }): Promise<Context> {
  return { userId: getUserIdFromAuthHeader(req.headers.authorization) }
}

export function requireUser(ctx: Context): string {
  if (!ctx.userId) throw unauthenticated()
  return ctx.userId
}
