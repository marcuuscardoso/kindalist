import { BulkCreateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { BulkCreateTaskInput } from './bulk-create-task.input'
import { BulkCreateTaskOutput } from './bulk-create-task.output'

export class BulkCreateTaskUseCase implements BulkCreateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: BulkCreateTaskInput): Promise<BulkCreateTaskOutput> {
    throw new Error('Not implemented')
  }
}
