import { Express } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { ListController } from '../controllers/list.controller'
import { TaskController } from '../controllers/task.controller'
import { defineAuthRoutes } from './auth.routes'
import { defineListRoutes } from './list.routes'
import { defineTaskRoutes } from './task.routes'

type Controllers = {
  authController: AuthController
  listController: ListController
  taskController: TaskController
}

export function registerRoutes(app: Express, controllers: Controllers): void {
  app.use('/auth', defineAuthRoutes(controllers.authController))
  app.use('/lists', defineListRoutes(controllers.listController))
  app.use('/lists/:listId/tasks', defineTaskRoutes(controllers.taskController))
}
