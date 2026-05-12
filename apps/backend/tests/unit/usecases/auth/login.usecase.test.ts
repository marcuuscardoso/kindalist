import { LoginUseCase } from '@/core/application/usecases/auth/login/login.usecase'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { Role } from '@/core/domain/enums/user-role.enum'
import { ValidationException } from '@/core/domain/errors/validation.error'

const mockUserRepository: jest.Mocked<UserRepositoryPort> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
}

const mockSessionRepository: jest.Mocked<SessionRepositoryPort> = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  rotateRefreshToken: jest.fn(),
  delete: jest.fn(),
}

const mockPasswordHasher: jest.Mocked<PasswordHasherPort> = {
  hash: jest.fn(),
  compare: jest.fn(),
}

const mockTokenService: jest.Mocked<TokenServicePort> = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}

describe('LoginUseCase', () => {
  let usecase: LoginUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    mockPasswordHasher.hash.mockResolvedValue('hashed-refresh-token')
    mockPasswordHasher.compare.mockResolvedValue(true)
    mockTokenService.generateAccessToken.mockReturnValue('access-token')
    mockTokenService.generateRefreshToken.mockReturnValue('raw-refresh-token')
    mockSessionRepository.create.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date('2026-01-08T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    usecase = new LoginUseCase(mockUserRepository, mockSessionRepository, mockPasswordHasher, mockTokenService)
  })

  it('should return access and refresh tokens when credentials are valid', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    const output = await usecase.execute({
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(output).toEqual({
      user: {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
      },
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      sessionId: expect.any(String),
    })
  })

  it('should throw NotFoundException when user does not exist', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)

    await expect(
      usecase.execute({
        email: 'missing@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should throw ValidationException when password is incorrect', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockPasswordHasher.compare.mockResolvedValue(false)

    await expect(
      usecase.execute({
        email: 'john@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(ValidationException)
  })

  it('should call passwordHasher.compare with plain password and stored hash', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockPasswordHasher.compare.mockResolvedValue(true)

    await usecase.execute({
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockPasswordHasher.compare).toHaveBeenCalledWith('plain-password', 'hashed-password')
  })

  it('should call tokenService.generateAccessToken with userId and role', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockPasswordHasher.compare.mockResolvedValue(true)

    await usecase.execute({
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({ userId: 'user-id', role: Role.MEMBER })
  })

  it('should call tokenService.generateRefreshToken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockPasswordHasher.compare.mockResolvedValue(true)

    await usecase.execute({
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockTokenService.generateRefreshToken).toHaveBeenCalled()
  })
})
