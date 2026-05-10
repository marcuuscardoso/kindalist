import { CreateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { CreateTaskData, TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { removeUndefined } from '@/core/application/utils/remove-undefined'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { CreateTaskInput } from './create-task.input'
import { CreateTaskOutput } from './create-task.output'

export class CreateTaskUseCase implements CreateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    const list = await this.listRepository.findById(input.listId)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    const data: CreateTaskData = removeUndefined({
      listId: input.listId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      deadline: input.deadline,
    })

    return this.taskRepository.create(data)
  }
}
