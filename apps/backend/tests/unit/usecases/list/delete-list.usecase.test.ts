import { DeleteListUseCase } from '@/core/application/usecases/list/delete-list/delete-list.usecase'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

const mockListRepository: jest.Mocked<ListRepositoryPort> = {
  findById: jest.fn(),
  findManyByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('DeleteListUseCase', () => {
  let usecase: DeleteListUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new DeleteListUseCase(mockListRepository)
  })

  it('should delete list when user is owner', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockListRepository.delete.mockResolvedValue(undefined)

    const output = await usecase.execute({ id: 'list-id', userId: 'user-id' })

    expect(output).toEqual({ success: true })
  })

  it('should throw NotFoundException when list does not exist', async () => {
    mockListRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ id: 'list-id', userId: 'user-id' })).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should throw UnauthorizedException when user is not owner', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'owner-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(usecase.execute({ id: 'list-id', userId: 'other-user-id' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
