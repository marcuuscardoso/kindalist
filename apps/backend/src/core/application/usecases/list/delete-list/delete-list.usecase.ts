import { DeleteListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { DeleteListInput } from './delete-list.input'
import { DeleteListOutput } from './delete-list.output'

export class DeleteListUseCase implements DeleteListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: DeleteListInput): Promise<DeleteListOutput> {
    throw new Error('Not implemented')
  }
}
