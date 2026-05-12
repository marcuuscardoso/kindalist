import { Request, Response } from 'express'
import { sanitizeMiddleware } from '@/adapters/input/http/middlewares/sanitize.middleware'

function createRequest(body: unknown): Request {
  return { body } as Request
}

describe('sanitizeMiddleware', () => {
  it('should sanitize a simple string field', () => {
    const req = createRequest({ title: '<script>alert("xss")</script>Task' })
    const next = jest.fn()

    sanitizeMiddleware(req, {} as Response, next)

    expect(req.body).toEqual({ title: 'Task' })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should sanitize nested objects', () => {
    const req = createRequest({
      task: {
        title: '<b>Important</b>',
        metadata: {
          notes: '<img src=x onerror=alert(1)>safe',
        },
      },
    })
    const next = jest.fn()

    sanitizeMiddleware(req, {} as Response, next)

    expect(req.body).toEqual({
      task: {
        title: 'Important',
        metadata: {
          notes: 'safe',
        },
      },
    })
  })

  it('should sanitize arrays recursively', () => {
    const req = createRequest({
      items: ['<p>one</p>', { title: '<a href="https://example.com">two</a>' }],
    })
    const next = jest.fn()

    sanitizeMiddleware(req, {} as Response, next)

    expect(req.body).toEqual({
      items: ['one', { title: 'two' }],
    })
  })

  it('should preserve non-string primitive values and null', () => {
    const req = createRequest({
      text: null,
      count: 10,
      active: true,
      nested: {
        deadline: undefined,
      },
    })
    const next = jest.fn()

    sanitizeMiddleware(req, {} as Response, next)

    expect(req.body).toEqual({
      text: null,
      count: 10,
      active: true,
      nested: {
        deadline: undefined,
      },
    })
  })

  it('should call next when body is missing', () => {
    const req = {} as Request
    const next = jest.fn()

    sanitizeMiddleware(req, {} as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})
