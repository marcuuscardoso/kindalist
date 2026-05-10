import { BulkCreateTaskInput } from '@/core/application/usecases/task/bulk-create-task/bulk-create-task.input'
import { BulkCreateTaskOutput } from '@/core/application/usecases/task/bulk-create-task/bulk-create-task.output'
import { CreateTaskInput } from '@/core/application/usecases/task/create-task/create-task.input'
import { CreateTaskOutput } from '@/core/application/usecases/task/create-task/create-task.output'
import { DeleteTaskInput } from '@/core/application/usecases/task/delete-task/delete-task.input'
import { DeleteTaskOutput } from '@/core/application/usecases/task/delete-task/delete-task.output'
import { GetTasksInput } from '@/core/application/usecases/task/get-tasks/get-tasks.input'
import { GetTasksOutput } from '@/core/application/usecases/task/get-tasks/get-tasks.output'
import { UpdateTaskInput } from '@/core/application/usecases/task/update-task/update-task.input'
import { UpdateTaskOutput } from '@/core/application/usecases/task/update-task/update-task.output'

export interface CreateTaskUseCasePort {
  execute(input: CreateTaskInput): Promise<CreateTaskOutput>
}

export interface BulkCreateTaskUseCasePort {
  execute(input: BulkCreateTaskInput): Promise<BulkCreateTaskOutput>
}

export interface GetTasksUseCasePort {
  execute(input: GetTasksInput): Promise<GetTasksOutput>
}

export interface UpdateTaskUseCasePort {
  execute(input: UpdateTaskInput): Promise<UpdateTaskOutput>
}

export interface DeleteTaskUseCasePort {
  execute(input: DeleteTaskInput): Promise<DeleteTaskOutput>
}
