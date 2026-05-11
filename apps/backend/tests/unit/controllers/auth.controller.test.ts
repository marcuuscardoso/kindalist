import { Request, Response } from 'express'
import { AuthController } from '@/adapters/input/http/controllers/auth.controller'
import { errorHandler } from '@/adapters/input/http/error-handler'
import {
  LoginUseCasePort,
  LogoutUseCasePort,
  RefreshUseCasePort,
  RegisterUseCasePort,
} from '@/core/application/ports/input/auth.usecase.port'
import { ConflictException } from '@/core/domain/errors/conflict.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

type MockResponse = Response & {
  status: jest.Mock
  json: jest.Mock
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

function createResponse(): MockResponse {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
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
    const req = createRequest({ body: {} })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.refresh(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 409 when register usecase throws ConflictException', async () => {
    const req = createRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
      },
    })
    const res = createResponse()

    mockRegisterUseCase.execute.mockRejectedValue(new ConflictException('User'))

    await executeWithErrorHandler(() => controller.register(req, res), res)

    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('should return 403 when logout usecase throws UnauthorizedException', async () => {
    const req = createRequest({
      body: { sessionId: 'session-id' },
      user: { userId: 'user-id', role: 'MEMBER' },
    })
    const res = createResponse()

    mockLogoutUseCase.execute.mockRejectedValue(new UnauthorizedException())

    await executeWithErrorHandler(() => controller.logout(req, res), res)

    expect(res.status).toHaveBeenCalledWith(403)
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
    }
    const req = createRequest({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret',
      },
    })
    const res = createResponse()

    mockRegisterUseCase.execute.mockResolvedValue(output)

    await controller.register(req, res)

    expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret',
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
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
    }
    const req = createRequest({
      body: {
        email: 'john@example.com',
        password: 'secret',
      },
    })
    const res = createResponse()

    mockLoginUseCase.execute.mockResolvedValue(output)

    await controller.login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
  })

  it('should return 200 when refresh succeeds', async () => {
    const output = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }
    const req = createRequest({
      body: {
        refreshToken: 'refresh-token',
      },
    })
    const res = createResponse()

    mockRefreshUseCase.execute.mockResolvedValue(output)

    await controller.refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 200 when logout succeeds', async () => {
    const output = { success: true }
    const req = createRequest({
      body: { sessionId: 'session-id' },
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
  })
})
