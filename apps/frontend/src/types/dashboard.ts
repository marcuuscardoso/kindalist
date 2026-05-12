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
  archivedCount: number
  isLoading: boolean
  error: string | null
}
