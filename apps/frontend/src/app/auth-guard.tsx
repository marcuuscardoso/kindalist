import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { routes } from './routes'

export function AuthGuard() {
  const { status, isAuthenticated } = useAuth()

  if (status === 'loading') return null
  if (!isAuthenticated) return <Navigate to={routes.login} replace />

  return <Outlet />
}

export function GuestGuard() {
  const { status, isAuthenticated } = useAuth()

  if (status === 'loading') return null
  if (isAuthenticated) return <Navigate to={routes.app} replace />

  return <Outlet />
}
