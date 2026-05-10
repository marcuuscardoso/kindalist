import { PrismaClient, Task as PrismaTask } from '@prisma/client'
import {
  CreateTaskData,
  TaskRepositoryPort,
  UpdateTaskData,
} from '@/core/application/ports/output/task.repository.port'
import { Task } from '@/core/domain/entities/task.entity'
import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'

export class TaskPrismaRepository implements TaskRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(model: PrismaTask): Task {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      status: model.status as TaskStatus,
      priority: model.priority as TaskPriority,
      deadline: model.deadline,
      listId: model.listId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    }
  }

  async findById(id: string): Promise<Task | null> {
    const model = await this.prisma.task.findUnique({ where: { id } })
    return model ? this.toEntity(model) : null
  }

  async findManyByListId(listId: string): Promise<Task[]> {
    const models = await this.prisma.task.findMany({ where: { listId } })
    return models.map(this.toEntity.bind(this))
  }

  async create(data: CreateTaskData): Promise<Task> {
    const model = await this.prisma.task.create({ data })
    return this.toEntity(model)
  }

  async createMany(data: CreateTaskData[]): Promise<{ count: number }> {
    return this.prisma.task.createMany({ data })
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const model = await this.prisma.task.update({
      where: { id },
      data,
    })
    return this.toEntity(model)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.deleteMany({ where: { id } })
  }
}
