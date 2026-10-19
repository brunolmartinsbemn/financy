import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/auth'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transacoes', label: 'Transações' },
  { to: '/categorias', label: 'Categorias' },
]

export function AppLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid h-[69px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-12">
          <Link to="/" aria-label="Dashboard">
            <Logo />
          </Link>
          <nav className="flex items-center gap-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  cn('text-sm transition-colors', isActive ? 'font-semibold text-brand-base' : 'text-gray-600 hover:text-gray-800')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/perfil"
            aria-label="Perfil"
            className="justify-self-end inline-flex size-9 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-800 transition-opacity hover:opacity-80"
          >
            {user ? initials(user.name) : ''}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-12 py-12">
        <Outlet />
      </main>
    </div>
  )
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-base text-gray-600">{description}</p>
      </div>
      {action}
    </div>
  )
}
