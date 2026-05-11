import { AuthController } from '../controllers/auth.controller'
import { EAuthMethod, ERouterMethod, defineRouter } from './define-router'

export function defineAuthRoutes(controller: AuthController) {
  return defineRouter([
    {
      method: ERouterMethod.POST,
      url: '/register',
      authMethod: EAuthMethod.PUBLIC,
      handler: (req, res) => controller.register(req, res),
    },
    {
      method: ERouterMethod.POST,
      url: '/login',
      authMethod: EAuthMethod.PUBLIC,
      handler: (req, res) => controller.login(req, res),
    },
    {
      method: ERouterMethod.POST,
      url: '/logout',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.logout(req, res),
    },
    {
      method: ERouterMethod.POST,
      url: '/refresh',
      authMethod: EAuthMethod.PUBLIC,
      handler: (req, res) => controller.refresh(req, res),
    },
  ])
}
