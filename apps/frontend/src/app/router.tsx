import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginPage } from '@/pages/auth/login.page'
import { RegisterPage } from '@/pages/auth/register.page'
import { DashboardPage } from '@/pages/dashboard/dashboard.page'
import { ListViewPage } from '@/pages/list/list-view.page'
import { AuthGuard, GuestGuard } from './auth-guard'
import { routes } from './routes'

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
        element: <AppLayout />,
        children: [
          {
            path: routes.app,
            element: <DashboardPage />,
          },
          {
            path: '/app/lists',
            element: <DashboardPage />,
          },
          {
            path: '/app/lists/:listId',
            element: <ListViewPage />,
          },
        ],
      },
    ],
  },
])
