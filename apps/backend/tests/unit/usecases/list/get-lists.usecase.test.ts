import { GetListsUseCase } from '@/core/application/usecases/list/get-lists/get-lists.usecase'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'

const mockListRepository: jest.Mocked<ListRepositoryPort> = {
  findById: jest.fn(),
  findManyByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('GetListsUseCase', () => {
  let usecase: GetListsUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new GetListsUseCase(mockListRepository)
  })

  it('should return only active lists when archived is false', async () => {
    const lists = [
      {
        id: 'list-id',
        title: 'Work',
        description: null,
        isArchived: false,
        userId: 'user-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]
    mockListRepository.findManyByUserId.mockResolvedValue(lists)

    const output = await usecase.execute({ userId: 'user-id', archived: false })

    expect(output).toEqual(lists)
  })

  it('should return only archived lists when archived is true', async () => {
    const lists = [
      {
        id: 'archived-list-id',
        title: 'Old',
        description: null,
        isArchived: true,
        userId: 'user-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]
    mockListRepository.findManyByUserId.mockResolvedValue(lists)

    const output = await usecase.execute({ userId: 'user-id', archived: true })

    expect(output).toEqual(lists)
  })
})
