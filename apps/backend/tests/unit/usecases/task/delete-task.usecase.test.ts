import { DeleteTaskUseCase } from '@/core/application/usecases/task/delete-task/delete-task.usecase'
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

describe('DeleteTaskUseCase', () => {
  let usecase: DeleteTaskUseCase

  beforeEach(() => {
    jest.clearAllMocks()
    usecase = new DeleteTaskUseCase(mockTaskRepository, mockListRepository)
  })

  it('should delete task when user is owner', async () => {
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
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    mockTaskRepository.delete.mockResolvedValue(undefined)

    const output = await usecase.execute({ id: 'task-id', userId: 'user-id', listId: 'list-id' })

    expect(output).toEqual({ success: true })
  })

  it('should throw NotFoundException when task does not exist', async () => {
    mockTaskRepository.findById.mockResolvedValue(null)

    await expect(usecase.execute({ id: 'task-id', userId: 'user-id', listId: 'list-id' })).rejects.toBeInstanceOf(
      NotFoundException,
    )
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

    await expect(usecase.execute({ id: 'task-id', userId: 'other-user-id', listId: 'list-id' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
