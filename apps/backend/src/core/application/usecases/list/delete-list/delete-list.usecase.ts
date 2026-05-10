import { DeleteListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { DeleteListInput } from './delete-list.input'
import { DeleteListOutput } from './delete-list.output'

export class DeleteListUseCase implements DeleteListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: DeleteListInput): Promise<DeleteListOutput> {
    const list = await this.listRepository.findById(input.id)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    await this.listRepository.delete(input.id)

    return { success: true }
  }
}
