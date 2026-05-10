export interface List {
  id: string
  title: string
  description: string | null
  isArchived: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}
