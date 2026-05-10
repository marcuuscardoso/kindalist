import { CreateTaskUseCase } from '@/core/application/usecases/task/create-task/create-task.usecase'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

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

describe('CreateTaskUseCase', () => {
  let usecase: CreateTaskUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new CreateTaskUseCase(mockTaskRepository, mockListRepository)
  })

  it('should create and return task when list exists and user is owner', async () => {
    const task = {
      id: 'task-id',
      title: 'Task',
      description: null,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      deadline: null,
      listId: 'list-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockTaskRepository.create.mockResolvedValue(task)

    const output = await usecase.execute({ userId: 'user-id', listId: 'list-id', title: 'Task' })

    expect(output).toEqual(task)
  })

  it('should throw NotFoundException when list does not exist', async () => {
    mockListRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ userId: 'user-id', listId: 'list-id', title: 'Task' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
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

    await expect(usecase.execute({ userId: 'other-user-id', listId: 'list-id', title: 'Task' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })

  it('should not call taskRepository.create when user is not owner of the list', async () => {
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'owner-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    await expect(usecase.execute({ userId: 'other-user-id', listId: 'list-id', title: 'Task' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )

    expect(mockTaskRepository.create).not.toHaveBeenCalled()
  })
})
