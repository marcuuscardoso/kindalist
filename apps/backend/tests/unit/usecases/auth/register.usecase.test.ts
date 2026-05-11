import { RegisterUseCase } from '@/core/application/usecases/auth/register/register.usecase'
import { PasswordHasherPort } from '@/core/application/ports/output/password-hasher.port'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
import { TokenServicePort } from '@/core/application/ports/output/token-service.port'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { ConflictException } from '@/core/domain/errors/conflict.error'
import { Role } from '@/core/domain/enums/user-role.enum'

const mockUserRepository: jest.Mocked<UserRepositoryPort> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
}

const mockSessionRepository: jest.Mocked<SessionRepositoryPort> = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
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

describe('RegisterUseCase', () => {
  let usecase: RegisterUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    mockPasswordHasher.hash.mockResolvedValue('hashed-value')
    mockTokenService.generateAccessToken.mockReturnValue('access-token')
    mockTokenService.generateRefreshToken.mockReturnValue('raw-refresh-token')
    mockUserRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
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
    usecase = new RegisterUseCase(mockUserRepository, mockSessionRepository, mockPasswordHasher, mockTokenService)
  })

  it('should create user and return access and refresh tokens when input is valid', async () => {
    const user = {
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockUserRepository.create.mockResolvedValue(user)

    const output = await usecase.execute({
      name: 'John Doe',
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

  it('should throw ConflictException when email already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(
      usecase.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('should call passwordHasher.hash with plain password', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockPasswordHasher.hash.mockResolvedValue('hashed-password')

    await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('plain-password')
  })

  it('should create user with member role when input is valid', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockPasswordHasher.hash.mockResolvedValue('hashed-password')

    await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: Role.MEMBER,
      }),
    )
  })

  it('should call tokenService.generateAccessToken with userId and role', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockPasswordHasher.hash.mockResolvedValue('hashed-password')
    mockUserRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({ userId: 'user-id', role: Role.MEMBER })
  })

  it('should call tokenService.generateRefreshToken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockPasswordHasher.hash.mockResolvedValue('hashed-password')
    mockUserRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockTokenService.generateRefreshToken).toHaveBeenCalled()
  })

  it('should call sessionRepository.create with hashed refresh token, not raw', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockPasswordHasher.hash.mockResolvedValueOnce('hashed-password').mockResolvedValueOnce('hashed-refresh-token')
    mockTokenService.generateRefreshToken.mockReturnValue('raw-refresh-token')
    mockUserRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await usecase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plain-password',
    })

    expect(mockSessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ refreshToken: 'hashed-refresh-token' }),
    )
  })
})
