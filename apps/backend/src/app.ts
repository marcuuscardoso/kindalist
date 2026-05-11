import cookieParser from 'cookie-parser'
import express from 'express'
import { errorHandler } from '@/adapters/input/http/error-handler'
import { sanitizeMiddleware } from '@/adapters/input/http/middlewares/sanitize.middleware'
import { registerRoutes } from '@/adapters/input/http/routes'
import { authController, listController, taskController } from '@/infrastructure/container'

export function createApp() {
  const app = express()

  app.set('trust proxy', true)
  app.use(cookieParser())
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(sanitizeMiddleware)

  registerRoutes(app, {
    authController,
    listController,
    taskController,
  })

  app.use(errorHandler)

  return app
}
