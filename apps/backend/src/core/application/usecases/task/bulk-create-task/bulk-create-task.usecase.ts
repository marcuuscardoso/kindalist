import { BulkCreateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { CreateTaskData, TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { removeUndefined } from '@/core/application/utils/remove-undefined'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { ValidationException } from '@/core/domain/errors/validation.error'
import { BulkCreateTaskInput } from './bulk-create-task.input'
import { BulkCreateTaskOutput } from './bulk-create-task.output'

const MAX_BULK_CREATE_TASKS = 1000

export class BulkCreateTaskUseCase implements BulkCreateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: BulkCreateTaskInput): Promise<BulkCreateTaskOutput> {
    if (input.tasks.length === 0) throw new ValidationException('Tasks array cannot be empty')
    if (input.tasks.length > MAX_BULK_CREATE_TASKS) {
      throw new ValidationException('Bulk create exceeds 1000 records limit')
    }

    const list = await this.listRepository.findById(input.listId)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    const tasks: CreateTaskData[] = input.tasks.map((task) =>
      removeUndefined({
        listId: input.listId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
      }),
    )

    const { count } = await this.taskRepository.createMany(tasks)

    return { count }
  }
}
