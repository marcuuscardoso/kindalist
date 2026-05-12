export type List = {
  id: string
  title: string
  description: string | null
  isArchived: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export type CreateListRequest = {
  title: string
  description?: string | null
}

export type UpdateListRequest = {
  title?: string
  description?: string | null
}

export type ArchiveListRequest = {
  isArchived: boolean
}
