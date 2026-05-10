import { Task } from '@/core/domain/entities/task.entity'
import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'

export type CreateTaskData = {
  listId: string
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: Date | null
}

export type UpdateTaskData = {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: Date | null
}

export interface TaskRepositoryPort {
  findById(id: string): Promise<Task | null>
  findManyByListId(listId: string): Promise<Task[]>
  create(data: CreateTaskData): Promise<Task>
  createMany(data: CreateTaskData[]): Promise<{ count: number }>
  update(id: string, data: UpdateTaskData): Promise<Task>
  delete(id: string): Promise<void>
}
