import { GetListsUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { GetListsInput } from './get-lists.input'
import { GetListsOutput } from './get-lists.output'

export class GetListsUseCase implements GetListsUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: GetListsInput): Promise<GetListsOutput> {
    throw new Error('Not implemented')
  }
}
