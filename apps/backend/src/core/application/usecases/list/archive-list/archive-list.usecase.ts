import { ArchiveListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { ArchiveListInput } from './archive-list.input'
import { ArchiveListOutput } from './archive-list.output'

export class ArchiveListUseCase implements ArchiveListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: ArchiveListInput): Promise<ArchiveListOutput> {
    const list = await this.listRepository.findById(input.id)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    return this.listRepository.update(input.id, { isArchived: input.isArchived })
  }
}
