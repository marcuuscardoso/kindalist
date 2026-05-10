import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'

export type BulkCreateTaskItemInput = {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: Date | null
}

export type BulkCreateTaskInput = {
  userId: string
  listId: string
  tasks: BulkCreateTaskItemInput[]
}
