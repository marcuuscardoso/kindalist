import { DeleteTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { DeleteTaskInput } from './delete-task.input'
import { DeleteTaskOutput } from './delete-task.output'

export class DeleteTaskUseCase implements DeleteTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: DeleteTaskInput): Promise<DeleteTaskOutput> {
    throw new Error('Not implemented')
  }
}
