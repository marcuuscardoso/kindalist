import express from 'express'
import { AddressInfo } from 'net'
import {
  authRateLimitMiddleware,
  globalRateLimitMiddleware,
} from '@/adapters/input/http/middlewares/rate-limit.middleware'

jest.setTimeout(10_000)

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

describe('rate limit middlewares', () => {
  it('should allow auth requests before the auth limit is reached', async () => {
    const app = express()
    app.post('/auth/login', authRateLimitMiddleware, (_req, res) => res.status(200).json({ ok: true }))

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/login`, { method: 'POST' })

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ ok: true })
    })
  })

  it('should return 429 when auth limit is exceeded', async () => {
    const app = express()
    app.post('/auth/login', authRateLimitMiddleware, (_req, res) => res.status(200).json({ ok: true }))

    await withServer(app, async (baseUrl) => {
      let response = await fetch(`${baseUrl}/auth/login`, { method: 'POST' })

      for (let index = 1; index < 21; index += 1) {
        response = await fetch(`${baseUrl}/auth/login`, { method: 'POST' })
      }

      expect(response.status).toBe(429)
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'Too many requests. Please try again later.',
        data: null,
      })
    })
  })

  it('should allow global requests before the global limit is reached', async () => {
    const app = express()
    app.use(globalRateLimitMiddleware)
    app.get('/health', (_req, res) => res.status(200).json({ ok: true }))

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`)

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ ok: true })
    })
  })

  it('should return 429 when global limit is exceeded', async () => {
    const app = express()
    app.use(globalRateLimitMiddleware)
    app.get('/health', (_req, res) => res.status(200).json({ ok: true }))

    await withServer(app, async (baseUrl) => {
      let response = await fetch(`${baseUrl}/health`)

      for (let index = 1; index < 301; index += 1) {
        response = await fetch(`${baseUrl}/health`)
      }

      expect(response.status).toBe(429)
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'Too many requests. Please try again later.',
        data: null,
      })
    })
  })
})
