import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { authenticationMiddleware } from '@/adapters/input/http/middlewares/auth.middleware'
import { EAuthMethod } from '@/adapters/input/http/routes/define-router'
import { Role } from '@/core/domain/enums/user-role.enum'
import { env } from '@/infrastructure/config/env'

type MockResponse = Response & {
  status: jest.Mock
  json: jest.Mock
}

function createResponse(): MockResponse {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }

  return response as unknown as MockResponse
}

function createRequest(input: Partial<Request>): Request {
  return input as Request
}

function createAccessToken(payload = { userId: 'user-id', role: Role.MEMBER }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET)
}

describe('authenticationMiddleware', () => {
  it('should return 401 when access token cookie is missing', () => {
    const req = createRequest({ cookies: {} })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unauthorized',
      data: null,
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when access token is invalid', () => {
    const req = createRequest({ cookies: { access_token: 'invalid-token' } })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 when token payload is invalid', () => {
    const req = createRequest({ cookies: { access_token: jwt.sign({ sub: 'user-id' }, env.JWT_ACCESS_SECRET) } })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should populate req.user and call next when access token is valid for open route', () => {
    const req = createRequest({
      auth: { method: EAuthMethod.OPEN },
      cookies: { access_token: createAccessToken() },
    })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(req.user).toEqual({ userId: 'user-id', role: Role.MEMBER })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should call next when private route allows user role', () => {
    const req = createRequest({
      auth: { method: EAuthMethod.PRIVATE, roles: [Role.MEMBER] },
      cookies: { access_token: createAccessToken() },
    })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 403 when private route does not allow user role', () => {
    const req = createRequest({
      auth: { method: EAuthMethod.PRIVATE, roles: [Role.ADMIN] },
      cookies: { access_token: createAccessToken() },
    })
    const res = createResponse()
    const next = jest.fn()

    authenticationMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unauthorized',
      data: null,
    })
    expect(next).not.toHaveBeenCalled()
  })
})
