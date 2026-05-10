import { ArchiveListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { ArchiveListInput } from './archive-list.input'
import { ArchiveListOutput } from './archive-list.output'

export class ArchiveListUseCase implements ArchiveListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: ArchiveListInput): Promise<ArchiveListOutput> {
    throw new Error('Not implemented')
  }
}
