import { AddressInfo } from 'net'
import { createApp } from '@/app'
import { env } from '@/infrastructure/config/env'

async function withServer<T>(action: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createApp().listen(0)
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

describe('cors', () => {
  it('should allow frontend origin with credentials', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'OPTIONS',
        headers: {
          Origin: env.FRONTEND_URL,
          'Access-Control-Request-Method': 'GET',
        },
      })

      expect(response.status).toBe(204)
      expect(response.headers.get('access-control-allow-origin')).toBe(env.FRONTEND_URL)
      expect(response.headers.get('access-control-allow-credentials')).toBe('true')
    })
  })
})
