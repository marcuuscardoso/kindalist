import { RefreshUseCase } from '@/core/application/usecases/auth/refresh/refresh.usecase'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { Role } from '@/core/domain/enums/user-role.enum'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

const mockSessionRepository: jest.Mocked<SessionRepositoryPort> = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const mockUserRepository: jest.Mocked<UserRepositoryPort> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
}

const mockTokenService: jest.Mocked<TokenServicePort> = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}

const mockPasswordHasher: jest.Mocked<PasswordHasherPort> = {
  hash: jest.fn(),
  compare: jest.fn(),
}

describe('RefreshUseCase', () => {
  let usecase: RefreshUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    mockPasswordHasher.compare.mockResolvedValue(true)
    mockPasswordHasher.hash.mockResolvedValue('new-hashed-refresh-token')
    mockTokenService.generateAccessToken.mockReturnValue('new-access-token')
    mockTokenService.generateRefreshToken.mockReturnValue('new-raw-refresh-token')
    mockUserRepository.findById.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    usecase = new RefreshUseCase(
      mockSessionRepository,
      mockUserRepository,
      mockTokenService,
      mockPasswordHasher,
    )
  })

  it('should return new access and refresh tokens when session and refresh token are valid', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'stored-hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    const output = await usecase.execute({
      sessionId: 'session-id',
      refreshToken: 'raw-refresh-token',
    })

    expect(output).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-raw-refresh-token',
      sessionId: 'session-id',
    })
  })

  it('should throw NotFoundException when session does not exist', async () => {
    mockSessionRepository.findById.mockResolvedValue(null)

    await expect(
      usecase.execute({
        sessionId: 'missing-session-id',
        refreshToken: 'raw-refresh-token',
      }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should delete session and throw UnauthorizedException when session is expired', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'stored-hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() - 60_000),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(
      usecase.execute({
        sessionId: 'session-id',
        refreshToken: 'raw-refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(mockSessionRepository.delete).toHaveBeenCalledWith('session-id')
  })

  it('should throw UnauthorizedException when refresh token is invalid', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'stored-hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockPasswordHasher.compare.mockResolvedValue(false)

    await expect(
      usecase.execute({
        sessionId: 'session-id',
        refreshToken: 'invalid-refresh-token',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('should rotate refresh token when refresh token is valid', async () => {
    mockSessionRepository.findById.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      refreshToken: 'stored-hashed-refresh-token',
      userAgent: null,
      ipAddress: null,
      lastUsedAt: new Date('2026-01-01T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await usecase.execute({
      sessionId: 'session-id',
      refreshToken: 'raw-refresh-token',
      userAgent: 'jest-agent',
      ipAddress: '127.0.0.1',
    })

    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
      'raw-refresh-token',
      'stored-hashed-refresh-token',
    )
    expect(mockSessionRepository.update).toHaveBeenCalledWith(
      'session-id',
      expect.objectContaining({
        refreshToken: 'new-hashed-refresh-token',
        userAgent: 'jest-agent',
        ipAddress: '127.0.0.1',
        lastUsedAt: expect.any(Date),
        expiresAt: expect.any(Date),
      }),
    )
  })
})
