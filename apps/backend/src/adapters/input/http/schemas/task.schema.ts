import { z } from 'zod'
import { TaskPriority } from '@/core/domain/enums/task-priority.enum'
import { TaskStatus } from '@/core/domain/enums/task-status.enum'

const taskFieldsSchema = {
  description: z.string().min(1).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  deadline: z.coerce.date().nullable().optional(),
}

export const createTaskSchema = z.object({
  title: z.string().min(1),
  ...taskFieldsSchema,
})

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    ...taskFieldsSchema,
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined ||
      data.priority !== undefined ||
      data.deadline !== undefined,
  )

export const bulkCreateTaskSchema = z.object({
  tasks: z.array(createTaskSchema),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>
export type BulkCreateTaskSchema = z.infer<typeof bulkCreateTaskSchema>
