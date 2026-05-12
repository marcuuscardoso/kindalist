import cookieParser from 'cookie-parser'
import express from 'express'
import jwt from 'jsonwebtoken'
import { AddressInfo } from 'net'
import { errorHandler } from '@/adapters/input/http/error-handler'
import { EAuthMethod, ERouterMethod, defineRouter } from '@/adapters/input/http/routes/define-router'
import { Role } from '@/core/domain/enums/user-role.enum'
import { env } from '@/infrastructure/config/env'

async function withServer<T>(app: express.Express, action: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = app.listen(0)
  const address = server.address() as AddressInfo

  try {
    return await action(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}

function createToken(role: Role): string {
  return jwt.sign({ userId: 'user-id', role }, env.JWT_ACCESS_SECRET)
}

function createApp(router: express.Router): express.Express {
  const app = express()
  app.use(cookieParser())
  app.use(router)
  app.use(errorHandler)

  return app
}

describe('defineRouter', () => {
  it('should not require authentication for public routes', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/public',
        authMethod: EAuthMethod.PUBLIC,
        handler: (req, res) => {
          res.status(200).json({ authMethod: req.auth?.method })
        },
      },
    ])

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/public`)

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ authMethod: EAuthMethod.PUBLIC })
    })
  })

  it('should return 401 for open routes when access token is missing', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/open',
        authMethod: EAuthMethod.OPEN,
        handler: (_req, res) => {
          res.status(200).json({ ok: true })
        },
      },
    ])

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/open`)

      expect(response.status).toBe(401)
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'Unauthorized',
        data: null,
      })
    })
  })

  it('should authenticate open routes with a valid access token', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/open',
        authMethod: EAuthMethod.OPEN,
        handler: (req, res) => {
          res.status(200).json({ user: req.user })
        },
      },
    ])
    const token = createToken(Role.MEMBER)

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/open`, {
        headers: { cookie: `access_token=${token}` },
      })

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({
        user: { userId: 'user-id', role: Role.MEMBER },
      })
    })
  })

  it('should return 403 for private routes when role is not allowed', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/admin',
        authMethod: EAuthMethod.PRIVATE,
        roles: [Role.ADMIN],
        handler: (_req, res) => {
          res.status(200).json({ ok: true })
        },
      },
    ])
    const token = createToken(Role.MEMBER)

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/admin`, {
        headers: { cookie: `access_token=${token}` },
      })

      expect(response.status).toBe(403)
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'Unauthorized',
        data: null,
      })
    })
  })

  it('should authenticate private routes when role is allowed', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/admin',
        authMethod: EAuthMethod.PRIVATE,
        roles: [Role.ADMIN],
        handler: (req, res) => {
          res.status(200).json({ user: req.user })
        },
      },
    ])
    const token = createToken(Role.ADMIN)

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/admin`, {
        headers: { cookie: `access_token=${token}` },
      })

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({
        user: { userId: 'user-id', role: Role.ADMIN },
      })
    })
  })

  it('should forward handler errors to the error handler', async () => {
    const router = defineRouter([
      {
        method: ERouterMethod.GET,
        url: '/error',
        authMethod: EAuthMethod.PUBLIC,
        handler: async () => {
          throw new Error('Unexpected failure')
        },
      },
    ])

    await withServer(createApp(router), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/error`)

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'An internal error occurred. Please try again later.',
        data: null,
      })
    })
  })
})
