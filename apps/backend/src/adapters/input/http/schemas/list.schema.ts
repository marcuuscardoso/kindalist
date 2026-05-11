import { z } from 'zod'

export const createListSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).nullable().optional(),
})

export const updateListSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).nullable().optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined)

export const archiveListSchema = z
  .object({
    isArchived: z.boolean().optional(),
  })
  .refine((data) => data.isArchived !== undefined)

export type CreateListSchema = z.infer<typeof createListSchema>
export type UpdateListSchema = z.infer<typeof updateListSchema>
export type ArchiveListSchema = z.infer<typeof archiveListSchema>
