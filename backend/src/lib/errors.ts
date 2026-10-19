import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'

export function unauthenticated() {
  return new GraphQLError('Não autenticado', { extensions: { code: 'UNAUTHENTICATED' } })
}

export function notFound(entity: string) {
  return new GraphQLError(`${entity} não encontrada`, { extensions: { code: 'NOT_FOUND' } })
}

export function badInput(message: string) {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
}

export function parseInput<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) throw badInput(error.issues[0]?.message ?? 'Dados inválidos')
    throw error
  }
}
