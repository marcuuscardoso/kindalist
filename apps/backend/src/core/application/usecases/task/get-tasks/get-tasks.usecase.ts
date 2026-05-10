import { GetTasksUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { GetTasksInput } from './get-tasks.input'
import { GetTasksOutput } from './get-tasks.output'

export class GetTasksUseCase implements GetTasksUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: GetTasksInput): Promise<GetTasksOutput> {
    throw new Error('Not implemented')
  }
}
