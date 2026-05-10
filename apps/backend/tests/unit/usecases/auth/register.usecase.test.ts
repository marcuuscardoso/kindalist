import { RegisterUseCase } from '@/core/application/usecases/auth/register/register.usecase'
import { SessionRepositoryPort } from '@/core/application/ports/output/session.repository.port'
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
  findByRefreshToken: jest.fn(),
  create: jest.fn(),
  updateLastUsedAt: jest.fn(),
  delete: jest.fn(),
}

describe('RegisterUseCase', () => {
  let usecase: RegisterUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new RegisterUseCase(mockUserRepository, mockSessionRepository)
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
})
