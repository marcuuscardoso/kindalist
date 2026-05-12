import { Task } from './task'

export type DashboardListSummary = {
  id: string
  title: string
  description: string | null
  color: string
  done: number
  total: number
  searchContent: string
}

export type AppLayoutContext = {
  lists: DashboardListSummary[]
  tasksByListId: Record<string, Task[]>
  archivedCount: number
  isLoading: boolean
  error: string | null
  reloadLayoutData(): Promise<void>
}
