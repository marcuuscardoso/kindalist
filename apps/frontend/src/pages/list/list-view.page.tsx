import {
  Archive,
  Check,
  ChevronDown,
  LayoutList,
  MoreHorizontal,
  Plus,
  Search,
  Columns3,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { routes } from '@/app/routes'
import { AppLayoutContext } from '@/types/dashboard'
import { Task, TaskPriority, TaskStatus } from '@/types/task'

type TaskSection = {
  status: TaskStatus
  title: string
  color: string
  tasks: Task[]
}

const priorityStyles: Record<TaskPriority, { label: string; className: string }> = {
  [TaskPriority.LOW]: {
    label: 'Baixa',
    className: 'border-[#b6e0c2] bg-[#e8faec] text-[#246b3f]',
  },
  [TaskPriority.MEDIUM]: {
    label: 'Média',
    className: 'border-[#ebd29c] bg-[#fdf4e3] text-[#7a5520]',
  },
  [TaskPriority.HIGH]: {
    label: 'Alta',
    className: 'border-[#f0bcbc] bg-[#fde7e7] text-[#9c2626]',
  },
}

const sectionMeta = {
  [TaskStatus.TODO]: {
    title: 'A fazer',
    color: 'hsl(240 4% 60%)',
  },
  [TaskStatus.IN_PROGRESS]: {
    title: 'Em progresso',
    color: 'hsl(38 92% 50%)',
  },
  [TaskStatus.DONE]: {
    title: 'Concluídas',
    color: 'hsl(142 55% 42%)',
  },
} satisfies Record<TaskStatus, { title: string; color: string }>

export function ListViewPage() {
  const { listId } = useParams()
  const { lists, tasksByListId, isLoading, error } = useOutletContext<AppLayoutContext>()
  const [search, setSearch] = useState('')
  const list = lists.find((currentList) => currentList.id === listId)
  const tasks = listId ? tasksByListId[listId] ?? [] : []

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tasks

    return tasks.filter((task) => {
      const title = task.title.toLowerCase()
      const description = task.description?.toLowerCase() ?? ''

      return title.includes(query) || description.includes(query)
    })
  }, [search, tasks])

  const sections = useMemo<TaskSection[]>(
    () =>
      [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => ({
        status,
        ...sectionMeta[status],
        tasks: visibleTasks.filter((task) => task.status === status),
      })),
    [visibleTasks],
  )

  const doneCount = tasks.filter((task) => task.status === TaskStatus.DONE).length

  if (!isLoading && !list) return <Navigate to={routes.app} replace />

  return (
    <>
      <Topbar search={search} onSearchChange={setSearch} />
      <section className="flex-1 overflow-auto px-7 pb-8 pt-6">
        {isLoading && <ListMessage>Carregando lista...</ListMessage>}
        {error && <ListMessage>{error}</ListMessage>}

        {!isLoading && !error && list && (
          <>
            <div className="mb-5">
              <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">{list.title}</h1>
              <p className="mt-1 text-[13px] leading-[1.45] text-[hsl(var(--muted-fg))]">
                {list.description ?? 'Sem descrição.'}
              </p>
            </div>

            <div className="mb-4 flex items-center gap-[10px]">
              <div className="inline-flex gap-0.5 rounded-[6px] bg-[hsl(var(--muted))] p-[3px]">
                <button className="inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] bg-[hsl(var(--bg))] px-[11px] text-[12.5px] font-medium text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]">
                  <LayoutList size={13} strokeWidth={1.6} />
                  Lista
                </button>
                <button className="inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] px-[11px] text-[12.5px] font-medium text-[hsl(var(--muted-fg))]">
                  <Columns3 size={13} strokeWidth={1.6} />
                  Board
                </button>
              </div>

              <div className="ml-auto font-mono text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
                {tasks.length} tasks · {doneCount} concluídas
              </div>
            </div>

            {sections.map((section) => (
              <TaskSectionCard key={section.status} section={section} />
            ))}
          </>
        )}
      </section>
    </>
  )
}

type TopbarProps = {
  search: string
  onSearchChange(search: string): void
}

function Topbar({ search, onSearchChange }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-6">
      <label className="flex h-[30px] w-full max-w-[360px] items-center gap-2 rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-[11px] text-[13px] text-[hsl(var(--muted-fg))]">
        <Search size={14} strokeWidth={1.6} />
        <input
          className="min-w-0 flex-1 bg-transparent text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--muted-fg))]"
          value={search}
          placeholder="Buscar tarefas, listas..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <span className="rounded bg-[hsl(var(--muted))] px-[5px] py-px font-mono text-[11px] leading-[1.4]">
          ⌘K
        </span>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button className="inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-3 text-[13px] font-medium text-[hsl(var(--fg))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]">
          <Archive size={14} strokeWidth={1.6} />
          Arquivar
        </button>
        <button className="inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-fg))] transition-opacity duration-150 hover:opacity-90">
          <Plus size={14} strokeWidth={1.6} />
          Nova task
        </button>
      </div>
    </header>
  )
}

function TaskSectionCard({ section }: { section: TaskSection }) {
  return (
    <section className="mb-[14px] overflow-hidden rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center gap-[9px] border-b border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-4 py-[11px]">
        <ChevronDown size={13} strokeWidth={1.6} className="text-[hsl(var(--muted-fg))]" />
        <span className="size-[7px] rounded-full" style={{ backgroundColor: section.color }} />
        <h4 className="text-[13px] font-semibold leading-[1.4]">{section.title}</h4>
        <span className="rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {section.tasks.length}
        </span>
        <button className="ml-auto text-[hsl(var(--muted-fg))] transition-colors duration-150 hover:text-[hsl(var(--fg))]">
          <Plus size={14} strokeWidth={1.6} />
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <TableHead className="w-8" />
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead className="w-[38px]" />
          </tr>
        </thead>
        <tbody>
          {section.tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-[14px] py-[18px] text-center text-[13px] text-[hsl(var(--muted-fg))]">
                Nenhuma task nesta seção.
              </td>
            </tr>
          )}
          {section.tasks.map((task, index) => (
            <TaskRow key={task.id} task={task} isLast={index === section.tasks.length - 1} />
          ))}
        </tbody>
      </table>
    </section>
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

function TaskRow({ task, isLast }: { task: Task; isLast: boolean }) {
  const isDone = task.status === TaskStatus.DONE

  return (
    <tr className="group">
      <td className={tableCellClass(isLast)}>
        <span
          className={`flex size-[14px] items-center justify-center rounded-[4px] border-[1.5px] ${
            isDone
              ? 'border-[hsl(var(--fg))] bg-[hsl(var(--fg))] text-[hsl(var(--bg))]'
              : 'border-[hsl(var(--border-strong))] bg-[hsl(var(--bg))]'
          }`}
        >
          {isDone && <Check size={10} strokeWidth={2} />}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <span
          className={`text-[13px] font-medium leading-[1.45] ${
            isDone ? 'text-[hsl(var(--muted-fg))] line-through' : 'text-[hsl(var(--fg))]'
          }`}
        >
          {task.title}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <span className="block max-w-[280px] truncate text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))]">
          {task.description ?? 'Sem descrição.'}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <span className="text-[12.5px] leading-[1.45] text-[hsl(var(--muted-fg))] tabular-nums">
          {formatDate(task.deadline)}
        </span>
      </td>
      <td className={tableCellClass(isLast)}>
        <PriorityBadge priority={task.priority} />
      </td>
      <td className={`${tableCellClass(isLast)} text-right text-[hsl(var(--muted-fg))]`}>
        <button className="inline-flex size-[26px] items-center justify-center rounded-[6px] transition-colors duration-150 hover:bg-[hsl(var(--muted))]">
          <MoreHorizontal size={14} strokeWidth={1.6} />
        </button>
      </td>
    </tr>
  )
}

function tableCellClass(isLast: boolean): string {
  return `px-[14px] py-[11px] align-middle text-[13px] transition-colors duration-150 group-hover:bg-[hsl(var(--subtle))] ${
    isLast ? '' : 'border-b border-[hsl(var(--border))]'
  }`
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const style = priorityStyles[priority]

  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full border px-2 text-[11.5px] font-medium leading-[1.4] ${style.className}`}
    >
      {style.label}
    </span>
  )
}

function formatDate(value: string | null): string {
  if (!value) return 'Sem prazo'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(value))
    .replace('.', '')
}

function ListMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-[132px] items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--border-strong))] text-[13px] text-[hsl(var(--muted-fg))]">
      {children}
    </div>
  )
}
