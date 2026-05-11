import { BulkCreateTaskInput } from '@/core/application/usecases/task/bulk-create-task/bulk-create-task.input'
import { CreateTaskInput } from '@/core/application/usecases/task/create-task/create-task.input'
import { DeleteTaskInput } from '@/core/application/usecases/task/delete-task/delete-task.input'
import { GetTasksInput } from '@/core/application/usecases/task/get-tasks/get-tasks.input'
import { UpdateTaskInput } from '@/core/application/usecases/task/update-task/update-task.input'
import { BulkCreateTaskSchema, CreateTaskSchema, UpdateTaskSchema } from '../schemas/task.schema'

export const taskMapper = {
  toCreateInput(body: CreateTaskSchema, userId: string, listId: string): CreateTaskInput {
    return {
      userId,
      listId,
      title: body.title,
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.deadline !== undefined && { deadline: body.deadline }),
    }
  },

  toUpdateInput(
    body: UpdateTaskSchema,
    userId: string,
    listId: string,
    taskId: string,
  ): UpdateTaskInput {
    return {
      id: taskId,
      userId,
      listId,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.deadline !== undefined && { deadline: body.deadline }),
    }
  },

  toDeleteInput(userId: string, listId: string, taskId: string): DeleteTaskInput {
    return {
      id: taskId,
      userId,
      listId,
    }
  },

  toBulkCreateInput(body: BulkCreateTaskSchema, userId: string, listId: string): BulkCreateTaskInput {
    return {
      userId,
      listId,
      tasks: body.tasks.map((task) => ({
        title: task.title,
        ...(task.description !== undefined && { description: task.description }),
        ...(task.status !== undefined && { status: task.status }),
        ...(task.priority !== undefined && { priority: task.priority }),
        ...(task.deadline !== undefined && { deadline: task.deadline }),
      })),
    }
  },

  toGetTasksInput(userId: string, listId: string): GetTasksInput {
    return {
      userId,
      listId,
    }
  },
}
