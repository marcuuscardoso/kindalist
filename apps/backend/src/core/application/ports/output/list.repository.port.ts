import { List } from '@/core/domain/entities/list.entity'

export type CreateListData = {
  userId: string
  title: string
  description?: string | null
}

export type UpdateListData = {
  title?: string
  description?: string | null
  isArchived?: boolean
}

export interface ListRepositoryPort {
  findById(id: string): Promise<List | null>
  findManyByUserId(userId: string, archived: boolean): Promise<List[]>
  create(data: CreateListData): Promise<List>
  update(id: string, data: UpdateListData): Promise<List>
  delete(id: string): Promise<void>
}
