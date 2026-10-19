import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

export const TOKEN_KEY = '@financy:token'

const httpLink = createHttpLink({ uri: import.meta.env.VITE_BACKEND_URL })

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(TOKEN_KEY)
  return { headers: { ...headers, ...(token && { authorization: `Bearer ${token}` }) } }
})

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some((error) => error.extensions?.code === 'UNAUTHENTICATED')) {
    localStorage.removeItem(TOKEN_KEY)
    window.dispatchEvent(new Event('financy:logout'))
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
