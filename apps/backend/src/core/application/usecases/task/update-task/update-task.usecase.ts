import { UpdateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { UpdateTaskInput } from './update-task.input'
import { UpdateTaskOutput } from './update-task.output'

export class UpdateTaskUseCase implements UpdateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    throw new Error('Not implemented')
  }
}
