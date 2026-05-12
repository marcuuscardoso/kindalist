import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'
import { authService } from '@/services/auth.service'
import { AuthUser, LoginRequest, RegisterRequest } from '@/types/auth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type RefreshUserOptions = {
  allowRefresh?: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login(data: LoginRequest): Promise<void>
  register(data: RegisterRequest): Promise<void>
  logout(): Promise<void>
  refreshUser(options?: RefreshUserOptions): Promise<void>
  hasSessionMarker(): boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_SESSION_STORAGE_KEY = 'kindalist.authenticated'

function setSessionMarker(): void {
  localStorage.setItem(AUTH_SESSION_STORAGE_KEY, 'true')
}

function clearSessionMarker(): void {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

function hasSessionMarker(): boolean {
  return localStorage.getItem(AUTH_SESSION_STORAGE_KEY) === 'true'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('unauthenticated')

  const refreshUser = useCallback(async (options: RefreshUserOptions = {}) => {
    setStatus('loading')

    try {
      const output = await authService.me(options)
      setSessionMarker()
      setUser(output.user)
      setStatus('authenticated')
    } catch {
      clearSessionMarker()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const output = await authService.login(data)
    setSessionMarker()
    setUser(output.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const output = await authService.register(data)
    setSessionMarker()
    setUser(output.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearSessionMarker()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout,
      refreshUser,
      hasSessionMarker,
    }),
    [login, logout, refreshUser, register, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
