import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'

export type CreateTaskInput = {
  userId: string
  listId: string
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: Date | null
}
