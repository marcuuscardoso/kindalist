import { UpdateTaskUseCase } from '@/core/application/usecases/task/update-task/update-task.usecase'
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

describe('UpdateTaskUseCase', () => {
  let usecase: UpdateTaskUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new UpdateTaskUseCase(mockTaskRepository, mockListRepository)
  })

  it('should update and return task when user is owner', async () => {
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
    const updatedTask = { ...task, status: TaskStatus.DONE }
    mockTaskRepository.findById.mockResolvedValue(task)
    mockListRepository.findById.mockResolvedValue({
      id: 'list-id',
      title: 'Work',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockTaskRepository.update.mockResolvedValue(updatedTask)

    const output = await usecase.execute({
      id: 'task-id',
      userId: 'user-id',
      listId: 'list-id',
      status: TaskStatus.DONE,
    })

    expect(output).toEqual(updatedTask)
  })

  it('should throw NotFoundException when task does not exist', async () => {
    mockTaskRepository.findById.mockResolvedValue(null)

    await expect(
      usecase.execute({ id: 'task-id', userId: 'user-id', listId: 'list-id', status: TaskStatus.DONE }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('should throw UnauthorizedException when user is not owner of the list', async () => {
    mockTaskRepository.findById.mockResolvedValue({
      id: 'task-id',
      title: 'Task',
      description: null,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      deadline: null,
      listId: 'list-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
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
      usecase.execute({ id: 'task-id', userId: 'other-user-id', listId: 'list-id', status: TaskStatus.DONE }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
