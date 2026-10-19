import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { ME } from '@/graphql/operations'
import type { User } from '@/graphql/types'
import { TOKEN_KEY } from '@/lib/apollo'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (token: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))

  const { data, loading } = useQuery<{ me: User }>(ME, { skip: !token })

  const signIn = useCallback(
    async (newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken)
      await client.resetStore()
      setToken(newToken)
    },
    [client],
  )

  const signOut = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    await client.clearStore()
  }, [client])

  useEffect(() => {
    const handleLogout = () => setToken(null)
    window.addEventListener('financy:logout', handleLogout)
    return () => window.removeEventListener('financy:logout', handleLogout)
  }, [])

  const user = token ? (data?.me ?? null) : null

  return (
    <AuthContext.Provider value={{ user, isLoading: !!token && loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
