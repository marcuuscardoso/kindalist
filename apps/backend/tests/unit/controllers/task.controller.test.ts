import { Request, Response } from 'express'
import { TaskController } from '@/adapters/input/http/controllers/task.controller'
import { errorHandler } from '@/adapters/input/http/error-handler'
import {
  BulkCreateTaskUseCasePort,
  CreateTaskUseCasePort,
  DeleteTaskUseCasePort,
  GetTasksUseCasePort,
  UpdateTaskUseCasePort,
} from '@/core/application/ports/input/task.usecase.port'
import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { ValidationException } from '@/core/domain/errors/validation.error'

type MockResponse = Response & {
  status: jest.Mock
  json: jest.Mock
}

const mockCreateTaskUseCase: jest.Mocked<CreateTaskUseCasePort> = {
  execute: jest.fn(),
}

const mockBulkCreateTaskUseCase: jest.Mocked<BulkCreateTaskUseCasePort> = {
  execute: jest.fn(),
}

const mockGetTasksUseCase: jest.Mocked<GetTasksUseCasePort> = {
  execute: jest.fn(),
}

const mockUpdateTaskUseCase: jest.Mocked<UpdateTaskUseCasePort> = {
  execute: jest.fn(),
}

const mockDeleteTaskUseCase: jest.Mocked<DeleteTaskUseCasePort> = {
  execute: jest.fn(),
}

function createResponse(): MockResponse {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }

  return response as unknown as MockResponse
}

function createRequest(input: Partial<Request>): Request {
  return {
    body: {},
    params: { listId: 'list-id' },
    user: { userId: 'user-id', role: 'MEMBER' },
    ...input,
  } as unknown as Request
}

async function executeWithErrorHandler(action: () => Promise<unknown>, response: Response): Promise<void> {
  try {
    await action()
  } catch (error) {
    errorHandler(error as Error, {} as Request, response, jest.fn())
  }
}

describe('TaskController', () => {
  let controller: TaskController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new TaskController(
      mockCreateTaskUseCase,
      mockBulkCreateTaskUseCase,
      mockGetTasksUseCase,
      mockUpdateTaskUseCase,
      mockDeleteTaskUseCase,
    )
  })

  it('should return 400 when create body is invalid', async () => {
    const req = createRequest({ body: {} })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.create(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 403 when create usecase throws UnauthorizedException', async () => {
    const req = createRequest({
      body: { title: 'My task' },
    })
    const res = createResponse()

    mockCreateTaskUseCase.execute.mockRejectedValue(new UnauthorizedException())

    await executeWithErrorHandler(() => controller.create(req, res), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('should return 404 when getMany usecase throws NotFoundException', async () => {
    const req = createRequest({})
    const res = createResponse()

    mockGetTasksUseCase.execute.mockRejectedValue(new NotFoundException('List'))

    await executeWithErrorHandler(() => controller.getMany(req, res), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should return 422 when bulkCreate usecase throws ValidationException', async () => {
    const req = createRequest({
      body: { tasks: [] },
    })
    const res = createResponse()

    mockBulkCreateTaskUseCase.execute.mockRejectedValue(new ValidationException('Tasks array cannot be empty'))

    await executeWithErrorHandler(() => controller.bulkCreate(req, res), res)

    expect(res.status).toHaveBeenCalledWith(422)
  })

  it('should return 201 when create succeeds', async () => {
    const output = {
      id: 'task-id',
      title: 'My task',
      description: null,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      deadline: null,
      listId: 'list-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const req = createRequest({
      body: { title: 'My task' },
    })
    const res = createResponse()

    mockCreateTaskUseCase.execute.mockResolvedValue(output)

    await controller.create(req, res)

    expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      listId: 'list-id',
      title: 'My task',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
  })

  it('should return 200 when update succeeds', async () => {
    const output = {
      id: 'task-id',
      title: 'Updated task',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      deadline: null,
      listId: 'list-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const req = createRequest({
      body: { title: 'Updated task' },
      params: { listId: 'list-id', taskId: 'task-id' },
    })
    const res = createResponse()

    mockUpdateTaskUseCase.execute.mockResolvedValue(output)

    await controller.update(req, res)

    expect(mockUpdateTaskUseCase.execute).toHaveBeenCalledWith({
      id: 'task-id',
      userId: 'user-id',
      listId: 'list-id',
      title: 'Updated task',
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
