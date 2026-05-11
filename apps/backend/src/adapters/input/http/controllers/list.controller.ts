import { Request, Response } from 'express'
import {
  ArchiveListUseCasePort,
  CreateListUseCasePort,
  DeleteListUseCasePort,
  GetListsUseCasePort,
  UpdateListUseCasePort,
} from '@/core/application/ports/input/list.usecase.port'
import { apiResponse } from '@/shared/response/api-response'
import { listMapper } from '../mappers/list.mapper'
import { archiveListSchema, createListSchema, updateListSchema } from '../schemas/list.schema'

export class ListController {
  constructor(
    private readonly createListUseCase: CreateListUseCasePort,
    private readonly getListsUseCase: GetListsUseCasePort,
    private readonly updateListUseCase: UpdateListUseCasePort,
    private readonly archiveListUseCase: ArchiveListUseCasePort,
    private readonly deleteListUseCase: DeleteListUseCasePort,
  ) {}

  async create(req: Request, res: Response) {
    const body = createListSchema.parse(req.body)
    const input = listMapper.toCreateInput(body, req.user.userId)
    const output = await this.createListUseCase.execute(input)

    return res.status(201).json(apiResponse.success(output))
  }

  async getMany(req: Request, res: Response) {
    const input = listMapper.toGetListsInput(req.user.userId, req.query.archived === 'true')
    const output = await this.getListsUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async update(req: Request, res: Response) {
    const body = updateListSchema.parse(req.body)
    const input = listMapper.toUpdateInput(body, req.user.userId, req.params.listId as string)
    const output = await this.updateListUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async archive(req: Request, res: Response) {
    const body = archiveListSchema.parse(req.body)
    const input = listMapper.toArchiveInput(body, req.user.userId, req.params.listId as string)
    const output = await this.archiveListUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }

  async delete(req: Request, res: Response) {
    const input = listMapper.toDeleteInput(req.user.userId, req.params.listId as string)
    const output = await this.deleteListUseCase.execute(input)

    return res.status(200).json(apiResponse.success(output))
  }
}
