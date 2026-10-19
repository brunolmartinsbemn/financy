import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { Toaster } from 'sonner'
import { apolloClient } from '@/lib/apollo'
import { AuthProvider } from '@/contexts/auth'
import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <App />
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
