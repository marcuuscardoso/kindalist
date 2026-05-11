import { ListController } from '../controllers/list.controller'
import { EAuthMethod, ERouterMethod, defineRouter } from './define-router'

export function defineListRoutes(controller: ListController) {
  return defineRouter([
    {
      method: ERouterMethod.GET,
      url: '/',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.getMany(req, res),
    },
    {
      method: ERouterMethod.POST,
      url: '/',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.create(req, res),
    },
    {
      method: ERouterMethod.PATCH,
      url: '/:listId',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.update(req, res),
    },
    {
      method: ERouterMethod.PATCH,
      url: '/:listId/archive',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.archive(req, res),
    },
    {
      method: ERouterMethod.DELETE,
      url: '/:listId',
      authMethod: EAuthMethod.OPEN,
      handler: (req, res) => controller.delete(req, res),
    },
  ])
}
