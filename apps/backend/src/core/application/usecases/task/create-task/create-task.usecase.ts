import { CreateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { CreateTaskInput } from './create-task.input'
import { CreateTaskOutput } from './create-task.output'

export class CreateTaskUseCase implements CreateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    throw new Error('Not implemented')
  }
}
