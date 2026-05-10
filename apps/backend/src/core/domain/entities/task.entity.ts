import { TaskPriority } from '../enums/task-priority.enum'
import { TaskStatus } from '../enums/task-status.enum'

export type TaskProps = {
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

export class Task {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly status: TaskStatus
  readonly priority: TaskPriority
  readonly deadline: Date | null
  readonly listId: string
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: TaskProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.status = props.status
    this.priority = props.priority
    this.deadline = props.deadline
    this.listId = props.listId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}
