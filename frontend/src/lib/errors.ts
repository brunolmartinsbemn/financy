import { ApolloError } from '@apollo/client'

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (error instanceof ApolloError) {
    if (error.graphQLErrors[0]?.message) return error.graphQLErrors[0].message
    if (error.networkError) return 'Não foi possível conectar ao servidor'
  }
  return fallback
}
