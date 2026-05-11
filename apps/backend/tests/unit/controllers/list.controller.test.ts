import { Request, Response } from 'express'
import { ListController } from '@/adapters/input/http/controllers/list.controller'
import { errorHandler } from '@/adapters/input/http/error-handler'
import {
  ArchiveListUseCasePort,
  CreateListUseCasePort,
  DeleteListUseCasePort,
  GetListsUseCasePort,
  UpdateListUseCasePort,
} from '@/core/application/ports/input/list.usecase.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'

type MockResponse = Response & {
  status: jest.Mock
  json: jest.Mock
}

const mockCreateListUseCase: jest.Mocked<CreateListUseCasePort> = {
  execute: jest.fn(),
}

const mockGetListsUseCase: jest.Mocked<GetListsUseCasePort> = {
  execute: jest.fn(),
}

const mockUpdateListUseCase: jest.Mocked<UpdateListUseCasePort> = {
  execute: jest.fn(),
}

const mockArchiveListUseCase: jest.Mocked<ArchiveListUseCasePort> = {
  execute: jest.fn(),
}

const mockDeleteListUseCase: jest.Mocked<DeleteListUseCasePort> = {
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
    params: {},
    query: {},
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

describe('ListController', () => {
  let controller: ListController

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new ListController(
      mockCreateListUseCase,
      mockGetListsUseCase,
      mockUpdateListUseCase,
      mockArchiveListUseCase,
      mockDeleteListUseCase,
    )
  })

  it('should return 400 when create body is invalid', async () => {
    const req = createRequest({ body: {} })
    const res = createResponse()

    await executeWithErrorHandler(() => controller.create(req, res), res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 403 when update usecase throws UnauthorizedException', async () => {
    const req = createRequest({
      body: { title: 'Updated list' },
      params: { listId: 'list-id' },
    })
    const res = createResponse()

    mockUpdateListUseCase.execute.mockRejectedValue(new UnauthorizedException())

    await executeWithErrorHandler(() => controller.update(req, res), res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('should return 404 when update usecase throws NotFoundException', async () => {
    const req = createRequest({
      body: { title: 'Updated list' },
      params: { listId: 'list-id' },
    })
    const res = createResponse()

    mockUpdateListUseCase.execute.mockRejectedValue(new NotFoundException('List'))

    await executeWithErrorHandler(() => controller.update(req, res), res)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('should return 201 when create succeeds', async () => {
    const output = {
      id: 'list-id',
      title: 'My list',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const req = createRequest({
      body: { title: 'My list' },
    })
    const res = createResponse()

    mockCreateListUseCase.execute.mockResolvedValue(output)

    await controller.create(req, res)

    expect(mockCreateListUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      title: 'My list',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Success',
      data: output,
    })
  })

  it('should return 200 when getMany succeeds', async () => {
    const output = [
      {
        id: 'list-id',
        title: 'My list',
        description: null,
        isArchived: true,
        userId: 'user-id',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]
    const req = createRequest({
      query: { archived: 'true' },
    })
    const res = createResponse()

    mockGetListsUseCase.execute.mockResolvedValue(output)

    await controller.getMany(req, res)

    expect(mockGetListsUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      archived: true,
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 200 when update succeeds', async () => {
    const output = {
      id: 'list-id',
      title: 'Updated list',
      description: null,
      isArchived: false,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const req = createRequest({
      body: { title: 'Updated list' },
      params: { listId: 'list-id' },
    })
    const res = createResponse()

    mockUpdateListUseCase.execute.mockResolvedValue(output)

    await controller.update(req, res)

    expect(mockUpdateListUseCase.execute).toHaveBeenCalledWith({
      id: 'list-id',
      userId: 'user-id',
      title: 'Updated list',
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 200 when archive succeeds', async () => {
    const output = {
      id: 'list-id',
      title: 'My list',
      description: null,
      isArchived: true,
      userId: 'user-id',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    const req = createRequest({
      body: { isArchived: true },
      params: { listId: 'list-id' },
    })
    const res = createResponse()

    mockArchiveListUseCase.execute.mockResolvedValue(output)

    await controller.archive(req, res)

    expect(mockArchiveListUseCase.execute).toHaveBeenCalledWith({
      id: 'list-id',
      userId: 'user-id',
      isArchived: true,
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return 200 when delete succeeds', async () => {
    const output = { success: true }
    const req = createRequest({
      params: { listId: 'list-id' },
    })
    const res = createResponse()

    mockDeleteListUseCase.execute.mockResolvedValue(output)

    await controller.delete(req, res)

    expect(mockDeleteListUseCase.execute).toHaveBeenCalledWith({
      id: 'list-id',
      userId: 'user-id',
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
