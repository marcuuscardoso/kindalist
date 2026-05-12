import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services/auth.service'
import { AuthUser, LoginRequest, RegisterRequest } from '@/types/auth'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login(data: LoginRequest): Promise<void>
  register(data: RegisterRequest): Promise<void>
  logout(): Promise<void>
  refreshUser(): Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const refreshUser = useCallback(async () => {
    try {
      const output = await authService.me()
      setUser(output.user)
      setStatus('authenticated')
    } catch {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (data: LoginRequest) => {
    const output = await authService.login(data)
    setUser(output.user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const output = await authService.register(data)
    setUser(output.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
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
    }),
    [login, logout, refreshUser, register, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
