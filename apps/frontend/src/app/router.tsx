import { createBrowserRouter, Navigate } from 'react-router-dom'
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
        element: <EmptyRoute />,
      },
      {
        path: routes.register,
        element: <EmptyRoute />,
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
