import { LoginUseCase } from '@/core/application/usecases/auth/login/login.usecase'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
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
  findByRefreshToken: jest.fn(),
  create: jest.fn(),
  updateLastUsedAt: jest.fn(),
  delete: jest.fn(),
}

describe('LoginUseCase', () => {
  let usecase: LoginUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new LoginUseCase(mockUserRepository, mockSessionRepository)
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

    await expect(
      usecase.execute({
        email: 'john@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(ValidationException)
  })
})
