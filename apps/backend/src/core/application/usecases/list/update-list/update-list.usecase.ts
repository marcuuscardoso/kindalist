import { UpdateListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort, UpdateListData } from '@/core/application/ports/output/list.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { removeUndefined } from '@/core/application/utils/remove-undefined'
import { UpdateListInput } from './update-list.input'
import { UpdateListOutput } from './update-list.output'

export class UpdateListUseCase implements UpdateListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: UpdateListInput): Promise<UpdateListOutput> {
    const list = await this.listRepository.findById(input.id)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    const data: UpdateListData = removeUndefined({
      title: input.title,
      description: input.description,
    })

    if (Object.keys(data).length === 0) {
      return list
    }

    return this.listRepository.update(input.id, data)
  }
}
