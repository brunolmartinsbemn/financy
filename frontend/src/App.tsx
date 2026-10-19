import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import { AppLayout } from '@/components/app-layout'
import { LogoIcon } from '@/components/logo'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/dashboard'
import { TransactionsPage } from '@/pages/transactions'
import { CategoriesPage } from '@/pages/categories'
import { ProfilePage } from '@/pages/profile'

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LogoIcon className="size-10 animate-pulse text-brand-base" />
    </div>
  )
}

/** "/" renders the login when signed out and the dashboard when signed in. */
function RootRoute() {
  const { user } = useAuth()
  return user ? <AppLayout /> : <LoginPage />
}

function PrivateRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/" replace />
}

function GuestRoute() {
  const { user } = useAuth()
  return user ? <Navigate to="/" replace /> : <Outlet />
}

export function App() {
  const { isLoading } = useAuth()

  if (isLoading) return <SplashScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>

        <Route path="/" element={<RootRoute />}>
          <Route index element={<DashboardPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/transacoes" element={<TransactionsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
