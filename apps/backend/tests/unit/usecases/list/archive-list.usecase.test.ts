import { ArchiveListUseCase } from '@/core/application/usecases/list/archive-list/archive-list.usecase'
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

describe('ArchiveListUseCase', () => {
  let usecase: ArchiveListUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new ArchiveListUseCase(mockListRepository)
  })

  it('should set isArchived to true when list is active', async () => {
    const list = {
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const archivedList = { ...list, isArchived: true }
    mockListRepository.findById.mockResolvedValue(list)
    mockListRepository.update.mockResolvedValue(archivedList)

    const output = await usecase.execute({ id: 'list-id', userId: 'user-id', isArchived: true })

    expect(output).toEqual(archivedList)
  })

  it('should set isArchived to false when list is archived', async () => {
    const list = {
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: true,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const activeList = { ...list, isArchived: false }
    mockListRepository.findById.mockResolvedValue(list)
    mockListRepository.update.mockResolvedValue(activeList)

    const output = await usecase.execute({ id: 'list-id', userId: 'user-id', isArchived: false })

    expect(output).toEqual(activeList)
  })

  it('should throw NotFoundException when list does not exist', async () => {
    mockListRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ id: 'list-id', userId: 'user-id', isArchived: true })).rejects.toBeInstanceOf(
      NotFoundException,
    )
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

    await expect(usecase.execute({ id: 'list-id', userId: 'other-user-id', isArchived: true })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })

  it('should not call listRepository.update when user is not owner', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'owner-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(usecase.execute({ id: 'list-id', userId: 'other-user-id', isArchived: true })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )

    expect(mockListRepository.update).not.toHaveBeenCalled()
  })
})
