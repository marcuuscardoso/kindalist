import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/login.page'
import { RegisterPage } from '@/pages/auth/register.page'
import { AuthGuard, GuestGuard } from './auth-guard'
import { routes } from './routes'

const EmptyRoute = () => null

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={routes.app} replace />,
  },
  {
    element: <GuestGuard />,
    children: [
      {
        path: routes.login,
        element: <LoginPage />,
      },
      {
        path: routes.register,
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: routes.app,
        element: <EmptyRoute />,
      },
      {
        path: '/app/lists',
        element: <EmptyRoute />,
      },
      {
        path: '/app/lists/:listId',
        element: <EmptyRoute />,
      },
    ],
  },
])
