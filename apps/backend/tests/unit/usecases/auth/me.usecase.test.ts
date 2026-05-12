import { MeUseCase } from '@/core/application/usecases/auth/me/me.usecase'
import { UserRepositoryPort } from '@/core/application/ports/output/user.repository.port'
import { Role } from '@/core/domain/enums/user-role.enum'
import { NotFoundException } from '@/core/domain/errors/not-found.error'

const mockUserRepository: jest.Mocked<UserRepositoryPort> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
}

describe('MeUseCase', () => {
  let usecase: MeUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new MeUseCase(mockUserRepository)
  })

  it('should return current user when user exists', async () => {
    mockUserRepository.findById.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: Role.MEMBER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    const output = await usecase.execute({ userId: 'user-id' })

    expect(output).toEqual({
      user: {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.MEMBER,
      },
    })
  })

  it('should throw NotFoundException when user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ userId: 'missing-user-id' })).rejects.toBeInstanceOf(NotFoundException)
  })
})
