import { UpdateTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort, UpdateTaskData } from '@/core/application/ports/output/task.repository.port'
import { removeUndefined } from '@/core/application/utils/remove-undefined'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { UpdateTaskInput } from './update-task.input'
import { UpdateTaskOutput } from './update-task.output'

export class UpdateTaskUseCase implements UpdateTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    const task = await this.taskRepository.findById(input.id)
    if (!task) throw new NotFoundException('Task')
    if (task.listId !== input.listId) throw new UnauthorizedException()

    const list = await this.listRepository.findById(input.listId)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    const data: UpdateTaskData = removeUndefined({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      deadline: input.deadline,
    })

    return this.taskRepository.update(input.id, data)
  }
}
