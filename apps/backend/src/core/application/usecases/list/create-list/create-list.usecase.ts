import { CreateListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { CreateListInput } from './create-list.input'
import { CreateListOutput } from './create-list.output'

export class CreateListUseCase implements CreateListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: CreateListInput): Promise<CreateListOutput> {
    throw new Error('Not implemented')
  }
}
