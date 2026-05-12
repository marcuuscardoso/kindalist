export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  listId: string
  createdAt: string
  updatedAt: string
}

export type CreateTaskRequest = {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  deadline?: string | null
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>

export type BulkCreateTaskRequest = {
  tasks: CreateTaskRequest[]
}

export type BulkCreateTaskResponse = {
  count: number
}
