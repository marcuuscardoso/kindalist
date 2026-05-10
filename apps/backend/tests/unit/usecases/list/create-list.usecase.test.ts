import { CreateListUseCase } from '@/core/application/usecases/list/create-list/create-list.usecase'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'

const mockListRepository: jest.Mocked<ListRepositoryPort> = {
  findById: jest.fn(),
  findManyByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('CreateListUseCase', () => {
  let usecase: CreateListUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new CreateListUseCase(mockListRepository)
  })

  it('should create and return list when input is valid', async () => {
    const list = {
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    mockListRepository.create.mockResolvedValue(list)

    const output = await usecase.execute({ userId: 'user-id', title: 'Work' })

    expect(output).toEqual(list)
  })
})
