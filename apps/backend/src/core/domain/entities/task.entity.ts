import { TaskPriority } from '../enums/task-priority.enum'
import { TaskStatus } from '../enums/task-status.enum'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline: Date | null
  listId: string
  createdAt: Date
  updatedAt: Date
}
