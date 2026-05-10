import { UpdateListUseCasePort } from '@/core/application/ports/input/list.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { UpdateListInput } from './update-list.input'
import { UpdateListOutput } from './update-list.output'

export class UpdateListUseCase implements UpdateListUseCasePort {
  constructor(private readonly listRepository: ListRepositoryPort) {}

  async execute(input: UpdateListInput): Promise<UpdateListOutput> {
    throw new Error('Not implemented')
  }
}
