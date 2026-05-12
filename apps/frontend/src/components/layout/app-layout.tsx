import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { listService } from '@/services/list.service'
import { taskService } from '@/services/task.service'
import { AppLayoutContext, DashboardListSummary } from '@/types/dashboard'
import { List } from '@/types/list'
import { Task, TaskStatus } from '@/types/task'

const LIST_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#ec4899', '#14b8a6']

function toListSummary(list: List, tasks: Task[], index: number): DashboardListSummary {
  return {
    id: list.id,
    title: list.title,
    description: list.description,
    color: LIST_COLORS[index % LIST_COLORS.length] ?? '#7c3aed',
    done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
    total: tasks.length,
    searchContent: tasks
      .flatMap((task) => [task.title, task.description ?? ''])
      .join(' ')
      .toLowerCase(),
  }
}

export function AppLayout() {
  const { user } = useAuth()
  const [context, setContext] = useState<AppLayoutContext>({
    lists: [],
    archivedCount: 0,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    async function loadLayoutData() {
      setContext((currentContext) => ({ ...currentContext, isLoading: true, error: null }))

      try {
        const [activeLists, archivedLists] = await Promise.all([listService.getMany(false), listService.getMany(true)])
        const listsWithTasks = await Promise.all(
          activeLists.map(async (list, index) => ({
            list,
            index,
            tasks: await taskService.getMany(list.id),
          })),
        )

        if (!isMounted) return

        setContext({
          lists: listsWithTasks.map(({ list, tasks, index }) => toListSummary(list, tasks, index)),
          archivedCount: archivedLists.length,
          isLoading: false,
          error: null,
        })
      } catch {
        if (!isMounted) return
        setContext((currentContext) => ({
          ...currentContext,
          isLoading: false,
          error: 'Não foi possível carregar suas listas.',
        }))
      }
    }

    void loadLayoutData()

    return () => {
      isMounted = false
    }
  }, [])

  if (!user) return null

  return (
    <div className="flex h-screen min-h-[720px] bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <AppSidebar user={user} lists={context.lists} archivedCount={context.archivedCount} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet context={context} />
      </main>
    </div>
  )
}
