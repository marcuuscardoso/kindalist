import { Archive, Inbox, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listService } from '@/services/list.service'
import { taskService } from '@/services/task.service'
import { AppLayoutContext } from '@/types/dashboard'
import { List } from '@/types/list'
import { Task, TaskStatus } from '@/types/task'

type ArchivedListView = {
  id: string
  title: string
  description: string | null
  color: string
  done: number
  total: number
  archivedAt: string
}

const ARCHIVED_COLORS = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b']

function toArchivedList(list: List, tasks: Task[], index: number): ArchivedListView {
  return {
    id: list.id,
    title: list.title,
    description: list.description,
    color: ARCHIVED_COLORS[index % ARCHIVED_COLORS.length] ?? '#7c3aed',
    done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
    total: tasks.length,
    archivedAt: list.updatedAt,
  }
}

export function ArchivedPage() {
  const { reloadLayoutData } = useOutletContext<AppLayoutContext>()
  const [lists, setLists] = useState<ArchivedListView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadArchivedLists() {
      setIsLoading(true)
      setError(null)

      try {
        const archivedLists = await listService.getMany(true)
        const listsWithTasks = await Promise.all(
          archivedLists.map(async (list, index) => ({
            list,
            index,
            tasks: await taskService.getMany(list.id),
          })),
        )

        if (!isMounted) return

        setLists(listsWithTasks.map(({ list, tasks, index }) => toArchivedList(list, tasks, index)))
      } catch {
        if (!isMounted) return
        setError('Não foi possível carregar listas arquivadas.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadArchivedLists()

    return () => {
      isMounted = false
    }
  }, [])

  const totalTasks = lists.reduce((total, list) => total + list.total, 0)

  async function restoreList(listId: string) {
    await listService.archive(listId, { isArchived: false })
    setLists((currentLists) => currentLists.filter((list) => list.id !== listId))
    await reloadLayoutData()
  }

  async function deleteList(listId: string) {
    await listService.delete(listId)
    setLists((currentLists) => currentLists.filter((list) => list.id !== listId))
    await reloadLayoutData()
  }

  return (
    <>
      <Topbar />
      <section className="flex-1 overflow-auto px-7 pb-8 pt-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">Listas arquivadas</h1>
          <p className="mt-1 text-[13px] leading-[1.45] text-[hsl(var(--muted-fg))]">
            Coisas finalizadas, abandonadas, ou que deram em nada — você decide.
          </p>
        </div>

        <div className="mb-4 font-mono text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {lists.length} listas · {totalTasks} tasks no total
        </div>

        {isLoading && <ArchivedMessage>Carregando listas arquivadas...</ArchivedMessage>}
        {error && <ArchivedMessage>{error}</ArchivedMessage>}

        {!isLoading && !error && (
          <>
            <section className="overflow-hidden rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <div className="flex items-center gap-[9px] border-b border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-4 py-[11px]">
                <Archive size={13} strokeWidth={1.6} className="text-[hsl(var(--muted-fg))]" />
                <h4 className="text-[13px] font-semibold leading-[1.4]">Tudo arquivado</h4>
                <span className="rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
                  {lists.length}
                </span>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TableHead>Lista</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Arquivada em</TableHead>
                    <TableHead className="w-[220px]" />
                  </tr>
                </thead>
                <tbody>
                  {lists.length === 0 && (
                    <tr>
                      <td
                        className="px-[14px] py-[18px] text-center text-[13px] text-[hsl(var(--muted-fg))]"
                        colSpan={5}
                      >
                        Nenhuma lista arquivada encontrada.
                      </td>
                    </tr>
                  )}

                  {lists.map((list, index) => (
                    <ArchivedRow
                      key={list.id}
                      list={list}
                      isLast={index === lists.length - 1}
                      onRestore={() => void restoreList(list.id)}
                      onDelete={() => void deleteList(list.id)}
                    />
                  ))}
                </tbody>
              </table>
            </section>

            <div className="mt-4 flex items-center gap-[10px] rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-4 py-3 text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))]">
              <Inbox size={14} strokeWidth={1.6} />
              <span>
                Listas arquivadas ficam fora dos filtros, mas suas tasks ainda contam para histórico.
                Restaurar volta tudo do jeito que estava.
              </span>
            </div>
          </>
        )}
      </section>
    </>
  )
}

function Topbar() {
  return (
    <header className="h-14 shrink-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]" />
  )
}

function TableHead({ children, className = '' }: { children?: string; className?: string }) {
  return (
    <th
      className={`border-b border-[hsl(var(--border))] px-[14px] py-[9px] text-left text-[11px] font-medium uppercase leading-[1.4] tracking-[0.05em] text-[hsl(var(--muted-fg))] ${className}`}
    >
      {children}
    </th>
  )
}

type ArchivedRowProps = {
  list: ArchivedListView
  isLast: boolean
  onRestore(): void
  onDelete(): void
}

function ArchivedRow({ list, isLast, onRestore, onDelete }: ArchivedRowProps) {
  return (
    <tr className="group">
      <td className={tableCellClass(isLast)}>
        <div className="flex items-center gap-[10px]">
          <span
            className="flex size-[22px] items-center justify-center rounded-[5px] text-[11px] font-semibold text-white"
            style={{ backgroundColor: list.color }}
          >
            {list.title[0]?.toUpperCase()}
          </span>
          <span className="text-[13px] font-medium leading-[1.45] text-[hsl(var(--fg))]">{list.title}</span>
        </div>
      </td>
      <td className={tableCellClass(isLast)}>
        <span className="block max-w-[280px] truncate text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))]">
          {list.description ?? 'Sem descrição.'}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <span className="text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))] tabular-nums">
          {list.done}/{list.total}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <span className="text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))] tabular-nums">
          {formatDate(list.archivedAt)}
        </span>
      </td>
      <td className={`${tableCellClass(isLast)} text-right`}>
        <div className="inline-flex items-center gap-[6px]">
          <button
            className="inline-flex h-7 items-center justify-center gap-[6px] rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-[10px] text-[12.5px] font-medium text-[hsl(var(--fg))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
            type="button"
            onClick={onRestore}
          >
            <RotateCcw size={12} strokeWidth={1.6} />
            Restaurar
          </button>
          <button
            className="inline-flex size-7 items-center justify-center rounded-[6px] text-[hsl(var(--destructive))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
            type="button"
            onClick={onDelete}
          >
            <Trash2 size={12} strokeWidth={1.6} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function tableCellClass(isLast: boolean): string {
  return `px-[14px] py-[11px] align-middle text-[13px] transition-colors duration-150 group-hover:bg-[hsl(var(--subtle))] ${
    isLast ? '' : 'border-b border-[hsl(var(--border))]'
  }`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(value))
    .replace('.', '')
}

function ArchivedMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-[132px] items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--border-strong))] text-[13px] text-[hsl(var(--muted-fg))]">
      {children}
    </div>
  )
}
