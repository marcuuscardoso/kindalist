import { Request, Response } from 'express'
import { AuthController } from '@/adapters/input/http/controllers/auth.controller'
import { errorHandler } from '@/adapters/input/http/error-handler'
import {
  LoginUseCasePort,
  LogoutUseCasePort,
  MeUseCasePort,
  RefreshUseCasePort,
  RegisterUseCasePort,
} from '@/core/application/ports/input/auth.usecase.port'
import { Role } from '@/core/domain/enums/user-role.enum'
import { ConflictException } from '@/core/domain/errors/conflict.error'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

type MockResponse = Response & {
  status: jest.Mock
  json: jest.Mock
  cookie: jest.Mock
  clearCookie: jest.Mock
}

const mockRegisterUseCase: jest.Mocked<RegisterUseCasePort> = {
  execute: jest.fn(),
}

const mockLoginUseCase: jest.Mocked<LoginUseCasePort> = {
  execute: jest.fn(),
}

const mockLogoutUseCase: jest.Mocked<LogoutUseCasePort> = {
  execute: jest.fn(),
}

const mockRefreshUseCase: jest.Mocked<RefreshUseCasePort> = {
  execute: jest.fn(),
}

const mockMeUseCase: jest.Mocked<MeUseCasePort> = {
  execute: jest.fn(),
}

const accessCookieOptions = expect.objectContaining({
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
})

const refreshCookieOptions = expect.objectContaining({
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const clearCookieOptions = expect.objectContaining({
  httpOnly: true,
  sameSite: 'strict',
})

function createResponse(): MockResponse {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  }

  return response as unknown as MockResponse
}

function createRequest(input: Partial<Request>): Request {
  return {
    get: jest.fn().mockReturnValue('jest-agent'),
    ip: '127.0.0.1',
    ...input,
  } as unknown as Request
}

async function executeWithErrorHandler(action: () => Promise<unknown>, response: Response): Promise<void> {
  try {
    await action()
  } catch (error) {
    errorHandler(error as Error, {} as Request, response, jest.fn())
  }
}

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new AuthController(
      mockRegisterUseCase,
      mockLoginUseCase,
      mockLogoutUseCase,
      mockRefreshUseCase,
      mockMeUseCase,
    )
  })

  it('should return 400 when register body is invalid', async () => {
    const req = createRequest({ body: {} })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.register(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 400 when login body is invalid', async () => {
    const req = createRequest({ body: { email: 'invalid-email' } })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.login(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 400 when refresh body is invalid', async () => {
    const req = createRequest({ cookies: {} })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.refresh(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 409 when register usecase throws ConflictException', async () => {
    const req = createRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      },
    })
    const res = createResponse()

    mockRegisterUseCase.execute.mockRejectedValue(new ConflictException('User'))

    await executeWithErrorHandler(() => controller.register(req, res), res)

    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('should return 403 when logout usecase throws UnauthorizedException', async () => {
    const req = createRequest({
      cookies: { session_id: 'session-id' },
      user: { userId: 'user-id', role: 'MEMBER' },
    })
    const res = createResponse()

    mockLogoutUseCase.execute.mockRejectedValue(new UnauthorizedException())

    await executeWithErrorHandler(() => controller.logout(req, res), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('should return 404 when me usecase throws NotFoundException', async () => {
    const req = createRequest({
      user: { userId: 'missing-user-id', role: 'MEMBER' },
    })
    const res = createResponse()

    mockMeUseCase.execute.mockRejectedValue(new NotFoundException('User'))

    await executeWithErrorHandler(() => controller.me(req, res), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should return 201 when register succeeds', async () => {
    const output = {
      user: {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: 'session-id',
    }
    const req = createRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      },
    })
    const res = createResponse()

    mockRegisterUseCase.execute.mockResolvedValue(output)

    await controller.register(req, res)

    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: { user: output.user },
    })
    expect(res.cookie).toHaveBeenCalledWith('access_token', 'access-token', accessCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', refreshCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('session_id', 'session-id', refreshCookieOptions)
  })

  it('should return 200 when login succeeds', async () => {
    const output = {
      user: {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: 'session-id',
    }
    const req = createRequest({
      body: {
        email: 'john@example.com',
        password: 'Password123!',
      },
    })
    const res = createResponse()

    mockLoginUseCase.execute.mockResolvedValue(output)

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: { user: output.user },
    })
    expect(res.cookie).toHaveBeenCalledWith('access_token', 'access-token', accessCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', refreshCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('session_id', 'session-id', refreshCookieOptions)
  })

  it('should return 200 when refresh succeeds', async () => {
    const output = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: 'session-id',
    }
    const req = createRequest({
      cookies: {
        session_id: 'session-id',
        refresh_token: 'refresh-token',
      },
    })
    const res = createResponse()

    mockRefreshUseCase.execute.mockResolvedValue(output)

    await controller.refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(mockRefreshUseCase.execute).toHaveBeenCalledWith({
      sessionId: 'session-id',
      refreshToken: 'refresh-token',
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    })
    expect(res.cookie).toHaveBeenCalledWith('access_token', 'access-token', accessCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', refreshCookieOptions)
    expect(res.cookie).toHaveBeenCalledWith('session_id', 'session-id', refreshCookieOptions)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: { success: true },
    })
  })

  it('should return 200 when logout succeeds', async () => {
    const output = { success: true }
    const req = createRequest({
      cookies: { session_id: 'session-id' },
      user: { userId: 'user-id', role: 'MEMBER' },
    })
    const res = createResponse()

    mockLogoutUseCase.execute.mockResolvedValue(output)

    await controller.logout(req, res)

    expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({
      sessionId: 'session-id',
      userId: 'user-id',
    })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
    expect(res.clearCookie).toHaveBeenCalledWith('access_token', clearCookieOptions)
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', clearCookieOptions)
    expect(res.clearCookie).toHaveBeenCalledWith('session_id', clearCookieOptions)
  })

  it('should return 200 when me succeeds', async () => {
    const output = {
      user: {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.MEMBER,
      },
    }
    const req = createRequest({
      user: { userId: 'user-id', role: 'MEMBER' },
    })
    const res = createResponse()

    mockMeUseCase.execute.mockResolvedValue(output)

    await controller.me(req, res)

    expect(mockMeUseCase.execute).toHaveBeenCalledWith({ userId: 'user-id' })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
  })
})
