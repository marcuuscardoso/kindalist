import { BulkCreateTaskUseCase } from '@/core/application/usecases/task/bulk-create-task/bulk-create-task.usecase'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { ValidationException } from '@/core/domain/errors/validation.error'

const mockTaskRepository: jest.Mocked<TaskRepositoryPort> = {
  findById: jest.fn(),
  findManyByListId: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

const mockListRepository: jest.Mocked<ListRepositoryPort> = {
  findById: jest.fn(),
  findManyByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

describe('BulkCreateTaskUseCase', () => {
  let usecase: BulkCreateTaskUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new BulkCreateTaskUseCase(mockTaskRepository, mockListRepository)
  })

  it('should create all tasks and return count when array is valid', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockTaskRepository.createMany.mockResolvedValue({ count: 2 })

    const output = await usecase.execute({
      userId: 'user-id',
      listId: 'list-id',
      tasks: [{ title: 'Task 1' }, { title: 'Task 2' }],
    })

    expect(output).toEqual({ count: 2 })
  })

  it('should create tasks when array has exactly 1000 records', async () => {
    const tasks = Array.from({ length: 1000 }, (_, index) => ({ title: `Task ${index}` }))
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockTaskRepository.createMany.mockResolvedValue({ count: 1000 })

    const output = await usecase.execute({ userId: 'user-id', listId: 'list-id', tasks })

    expect(output).toEqual({ count: 1000 })
  })

  it('should throw ValidationException when array is empty', async () => {
    await expect(usecase.execute({ userId: 'user-id', listId: 'list-id', tasks: [] })).rejects.toBeInstanceOf(
      ValidationException,
    )
  })

  it('should not call taskRepository when array is empty', async () => {
    await expect(usecase.execute({ userId: 'user-id', listId: 'list-id', tasks: [] })).rejects.toBeInstanceOf(
      ValidationException,
    )

    expect(mockTaskRepository.createMany).not.toHaveBeenCalled()
  })

  it('should throw ValidationException when array exceeds 1000 records', async () => {
    const tasks = Array.from({ length: 1001 }, (_, index) => ({ title: `Task ${index}` }))

    await expect(usecase.execute({ userId: 'user-id', listId: 'list-id', tasks })).rejects.toBeInstanceOf(
      ValidationException,
    )
  })

  it('should not call taskRepository when array exceeds 1000 records', async () => {
    const tasks = Array.from({ length: 1001 }, (_, index) => ({ title: `Task ${index}` }))

    await expect(usecase.execute({ userId: 'user-id', listId: 'list-id', tasks })).rejects.toBeInstanceOf(
      ValidationException,
    )

    expect(mockTaskRepository.createMany).not.toHaveBeenCalled()
  })

  it('should throw NotFoundException when list does not exist', async () => {
    mockListRepository.findById.mockResolvedValue(null)

    await expect(
      usecase.execute({ userId: 'user-id', listId: 'list-id', tasks: [{ title: 'Task' }] }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should throw UnauthorizedException when user is not owner of the list', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'owner-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(
      usecase.execute({ userId: 'other-user-id', listId: 'list-id', tasks: [{ title: 'Task' }] }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
