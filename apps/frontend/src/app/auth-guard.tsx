import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { routes } from './routes'

export function AuthGuard() {
  const { status, isAuthenticated, refreshUser } = useAuth()
  const hasTriedRestore = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated' && !hasTriedRestore.current) {
      hasTriedRestore.current = true
      void refreshUser({ allowRefresh: true })
    }
  }, [refreshUser, status])

  if (status === 'loading') return null
  if (!isAuthenticated) return <Navigate to={routes.login} replace />

  return <Outlet />
}

export function GuestGuard() {
  const { status, isAuthenticated, refreshUser, hasSessionMarker } = useAuth()
  const hasTriedRestore = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated' && hasSessionMarker() && !hasTriedRestore.current) {
      hasTriedRestore.current = true
      void refreshUser({ allowRefresh: true })
    }
  }, [hasSessionMarker, refreshUser, status])

  if (status === 'loading') return null
  if (isAuthenticated) return <Navigate to={routes.app} replace />

  return <Outlet />
}
