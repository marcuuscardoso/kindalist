import { Request, Response } from 'express'
import {
  BulkCreateTaskUseCasePort,
  CreateTaskUseCasePort,
  DeleteTaskUseCasePort,
  GetTasksUseCasePort,
  UpdateTaskUseCasePort,
} from '@/core/application/ports/input/task.usecase.port'
import { apiResponse } from '@/shared/response/api-response'
import { taskMapper } from '../mappers/task.mapper'
import { bulkCreateTaskSchema, createTaskSchema, updateTaskSchema } from '../schemas/task.schema'

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCasePort,
    private readonly bulkCreateTaskUseCase: BulkCreateTaskUseCasePort,
    private readonly getTasksUseCase: GetTasksUseCasePort,
    private readonly updateTaskUseCase: UpdateTaskUseCasePort,
    private readonly deleteTaskUseCase: DeleteTaskUseCasePort,
  ) {}

  async create(req: Request, res: Response) {
    const body = createTaskSchema.parse(req.body)
    const input = taskMapper.toCreateInput(body, req.user.userId, req.params.listId as string)
    const output = await this.createTaskUseCase.execute(input)

    return res.status(201).json(apiResponse.success(output))
  }

  async bulkCreate(req: Request, res: Response) {
    const body = bulkCreateTaskSchema.parse(req.body)
    const input = taskMapper.toBulkCreateInput(body, req.user.userId, req.params.listId as string)
    const output = await this.bulkCreateTaskUseCase.execute(input)

    return res.status(201).json(apiResponse.success(output))
  }

  async getMany(req: Request, res: Response) {
    const input = taskMapper.toGetTasksInput(req.user.userId, req.params.listId as string)
    const output = await this.getTasksUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async update(req: Request, res: Response) {
    const body = updateTaskSchema.parse(req.body)
    const input = taskMapper.toUpdateInput(
      body,
      req.user.userId,
      req.params.listId as string,
      req.params.taskId as string,
    )
    const output = await this.updateTaskUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async delete(req: Request, res: Response) {
    const input = taskMapper.toDeleteInput(
      req.user.userId,
      req.params.listId as string,
      req.params.taskId as string,
    )
    const output = await this.deleteTaskUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }
}
