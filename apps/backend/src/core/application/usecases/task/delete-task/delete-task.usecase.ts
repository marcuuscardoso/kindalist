import { DeleteTaskUseCasePort } from '@/core/application/ports/input/task.usecase.port'
import { ListRepositoryPort } from '@/core/application/ports/output/list.repository.port'
import { TaskRepositoryPort } from '@/core/application/ports/output/task.repository.port'
import { NotFoundException } from '@/core/domain/errors/not-found.error'
import { UnauthorizedException } from '@/core/domain/errors/unauthorized.error'
import { DeleteTaskInput } from './delete-task.input'
import { DeleteTaskOutput } from './delete-task.output'

export class DeleteTaskUseCase implements DeleteTaskUseCasePort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly listRepository: ListRepositoryPort,
  ) {}

  async execute(input: DeleteTaskInput): Promise<DeleteTaskOutput> {
    const task = await this.taskRepository.findById(input.id)
    if (!task) throw new NotFoundException('Task')
    if (task.listId !== input.listId) throw new UnauthorizedException()

    const list = await this.listRepository.findById(input.listId)
    if (!list) throw new NotFoundException('List')
    if (list.userId !== input.userId) throw new UnauthorizedException()

    await this.taskRepository.delete(input.id)

    return { success: true }
  }
}
