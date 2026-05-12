import {
  Archive,
  CalendarDays,
  Check,
  ChevronDown,
  GripVertical,
  LayoutList,
  MoreHorizontal,
  Plus,
  Search,
  Columns3,
} from 'lucide-react'
import { DragEvent, useEffect, useMemo, useState } from 'react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { routes } from '@/app/routes'
import { CreateTaskDrawer } from '@/components/drawers/create-task-drawer'
import { EditTaskDrawer } from '@/components/drawers/edit-task-drawer'
import { taskService } from '@/services/task.service'
import { AppLayoutContext } from '@/types/dashboard'
import { Task, TaskPriority, TaskStatus } from '@/types/task'

type TaskSection = {
  status: TaskStatus
  title: string
  color: string
  boardTitle: string
  tasks: Task[]
}

type ViewMode = 'list' | 'board'

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
    boardTitle: 'TODO',
    color: 'hsl(240 4% 60%)',
  },
  [TaskStatus.IN_PROGRESS]: {
    title: 'Em progresso',
    boardTitle: 'IN PROGRESS',
    color: 'hsl(38 92% 50%)',
  },
  [TaskStatus.DONE]: {
    title: 'Concluídas',
    boardTitle: 'DONE',
    color: 'hsl(142 55% 42%)',
  },
} satisfies Record<TaskStatus, { title: string; boardTitle: string; color: string }>

export function ListViewPage() {
  const { listId } = useParams()
  const { lists, tasksByListId, isLoading, error, reloadLayoutData } = useOutletContext<AppLayoutContext>()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [localTasks, setLocalTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus | null>(null)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dropTargetStatus, setDropTargetStatus] = useState<TaskStatus | null>(null)
  const list = lists.find((currentList) => currentList.id === listId)
  const tasks = localTasks

  useEffect(() => {
    setLocalTasks(listId ? tasksByListId[listId] ?? [] : [])
  }, [listId, tasksByListId])

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

  function moveTask(taskId: string, status: TaskStatus) {
    if (!listId) return

    const previousTasks = localTasks
    setLocalTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    )

    void taskService
      .update(listId, taskId, { status })
      .then(() => reloadLayoutData())
      .catch(() => {
        setLocalTasks(previousTasks)
      })
  }

  function updateLocalTask(updatedTask: Task) {
    setLocalTasks((currentTasks) => currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    void reloadLayoutData()
  }

  function createLocalTask(task: Task) {
    setLocalTasks((currentTasks) => [...currentTasks, task])
    void reloadLayoutData()
  }

  function deleteLocalTask(taskId: string) {
    setLocalTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    void reloadLayoutData()
  }

  if (!isLoading && !list) return <Navigate to={routes.app} replace />

  return (
    <>
      <Topbar search={search} onSearchChange={setSearch} onCreateTask={() => setCreateTaskStatus(TaskStatus.TODO)} />
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
                <button
                  className={`inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] px-[11px] text-[12.5px] font-medium ${
                    viewMode === 'list'
                      ? 'bg-[hsl(var(--bg))] text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                      : 'text-[hsl(var(--muted-fg))]'
                  }`}
                  type="button"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList size={13} strokeWidth={1.6} />
                  Lista
                </button>
                <button
                  className={`inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] px-[11px] text-[12.5px] font-medium ${
                    viewMode === 'board'
                      ? 'bg-[hsl(var(--bg))] text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                      : 'text-[hsl(var(--muted-fg))]'
                  }`}
                  type="button"
                  onClick={() => setViewMode('board')}
                >
                  <Columns3 size={13} strokeWidth={1.6} />
                  Board
                </button>
              </div>

              <div className="ml-auto font-mono text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
                {viewMode === 'board' ? 'arraste cards entre colunas' : `${tasks.length} tasks · ${doneCount} concluídas`}
              </div>
            </div>

            {viewMode === 'list' &&
              sections.map((section) => (
                <TaskSectionCard
                  key={section.status}
                  section={section}
                  onCreateTask={setCreateTaskStatus}
                  onEditTask={setSelectedTask}
                />
              ))}

            {viewMode === 'board' && (
              <div className="grid h-full grid-cols-3 content-start gap-[14px]">
                {sections.map((section) => (
                  <BoardColumn
                    key={section.status}
                    section={section}
                    draggingTaskId={draggingTaskId}
                    isDropTarget={dropTargetStatus === section.status}
                    onDragStart={setDraggingTaskId}
                    onCreateTask={setCreateTaskStatus}
                    onEditTask={setSelectedTask}
                    onDragEnd={() => {
                      setDraggingTaskId(null)
                      setDropTargetStatus(null)
                    }}
                    onDragOver={setDropTargetStatus}
                    onDrop={(status) => {
                      if (!draggingTaskId) return

                      moveTask(draggingTaskId, status)
                      setDraggingTaskId(null)
                      setDropTargetStatus(null)
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
      {selectedTask && list && (
        <EditTaskDrawer
          list={list}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSaved={updateLocalTask}
          onDeleted={deleteLocalTask}
        />
      )}
      {createTaskStatus && list && (
        <CreateTaskDrawer
          list={list}
          initialStatus={createTaskStatus}
          onClose={() => setCreateTaskStatus(null)}
          onCreated={createLocalTask}
        />
      )}
    </>
  )
}

type TopbarProps = {
  search: string
  onSearchChange(search: string): void
  onCreateTask(): void
}

function Topbar({ search, onSearchChange, onCreateTask }: TopbarProps) {
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
        <button
          className="inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-fg))] transition-opacity duration-150 hover:opacity-90"
          type="button"
          onClick={onCreateTask}
        >
          <Plus size={14} strokeWidth={1.6} />
          Nova task
        </button>
      </div>
    </header>
  )
}

function TaskSectionCard({
  section,
  onCreateTask,
  onEditTask,
}: {
  section: TaskSection
  onCreateTask(status: TaskStatus): void
  onEditTask(task: Task): void
}) {
  return (
    <section className="mb-[14px] overflow-hidden rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center gap-[9px] border-b border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-4 py-[11px]">
        <ChevronDown size={13} strokeWidth={1.6} className="text-[hsl(var(--muted-fg))]" />
        <span className="size-[7px] rounded-full" style={{ backgroundColor: section.color }} />
        <h4 className="text-[13px] font-semibold leading-[1.4]">{section.title}</h4>
        <span className="rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {section.tasks.length}
        </span>
        <button
          className="ml-auto text-[hsl(var(--muted-fg))] transition-colors duration-150 hover:text-[hsl(var(--fg))]"
          type="button"
          onClick={() => onCreateTask(section.status)}
        >
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
            <TaskRow key={task.id} task={task} isLast={index === section.tasks.length - 1} onEditTask={onEditTask} />
          ))}
        </tbody>
      </table>
    </section>
  )
}

type BoardColumnProps = {
  section: TaskSection
  draggingTaskId: string | null
  isDropTarget: boolean
  onDragStart(taskId: string): void
  onCreateTask(status: TaskStatus): void
  onEditTask(task: Task): void
  onDragEnd(): void
  onDragOver(status: TaskStatus | null): void
  onDrop(status: TaskStatus): void
}

function BoardColumn({
  section,
  draggingTaskId,
  isDropTarget,
  onDragStart,
  onCreateTask,
  onEditTask,
  onDragEnd,
  onDragOver,
  onDrop,
}: BoardColumnProps) {
  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    onDragOver(section.status)
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    onDragOver(null)
  }

  return (
    <section
      className={`flex min-h-[200px] flex-col gap-[10px] rounded-[8px] border p-3 transition-colors duration-150 ${
        isDropTarget
          ? 'border-dashed border-[hsl(var(--fg)/0.35)] bg-[hsl(var(--fg)/0.04)]'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--subtle))]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(event) => {
        event.preventDefault()
        onDrop(section.status)
      }}
    >
      <div className="flex items-center gap-2 px-0.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: section.color }} />
        <h4 className="text-[12px] font-semibold uppercase leading-[1.4] tracking-[0.06em]">
          {section.boardTitle}
        </h4>
        <span className="rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {section.tasks.length}
        </span>
        <button
          className="ml-auto text-[hsl(var(--muted-fg))] transition-colors duration-150 hover:text-[hsl(var(--fg))]"
          type="button"
          onClick={() => onCreateTask(section.status)}
        >
          <Plus size={14} strokeWidth={1.6} />
        </button>
      </div>

      {section.tasks.length === 0 && (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border-strong))] px-3 py-[18px] text-center text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          Solte tasks aqui
        </div>
      )}

      {section.tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isDragging={draggingTaskId === task.id}
          onDragStart={onDragStart}
          onEditTask={onEditTask}
          onDragEnd={onDragEnd}
        />
      ))}
    </section>
  )
}

type TaskCardProps = {
  task: Task
  isDragging: boolean
  onDragStart(taskId: string): void
  onEditTask(task: Task): void
  onDragEnd(): void
}

function TaskCard({ task, isDragging, onDragStart, onEditTask, onDragEnd }: TaskCardProps) {
  return (
    <article
      className={`flex cursor-grab flex-col gap-2 rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-[11px] transition-[border-color,box-shadow,transform,opacity] duration-150 hover:border-[hsl(var(--border-strong))] ${
        isDragging ? 'cursor-grabbing opacity-50' : ''
      }`}
      draggable
      onClick={() => onEditTask(task)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', task.id)
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start gap-[6px]">
        <h5 className="min-w-0 flex-1 text-[13px] font-medium leading-[1.35]">{task.title}</h5>
        <GripVertical size={12} strokeWidth={1.6} className="shrink-0 text-[hsl(var(--muted-fg))] opacity-60" />
      </div>
      <p className="line-clamp-2 text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
        {task.description ?? 'Sem descrição.'}
      </p>
      <div className="mt-0.5 flex items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span className="flex-1" />
        <span className="inline-flex items-center gap-1 text-[11.5px] leading-[1.4] text-[hsl(var(--muted-fg))] tabular-nums">
          <CalendarDays size={12} strokeWidth={1.6} />
          {formatShortDate(task.deadline)}
        </span>
      </div>
    </article>
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

function TaskRow({
  task,
  isLast,
  onEditTask,
}: {
  task: Task
  isLast: boolean
  onEditTask(task: Task): void
}) {
  const isDone = task.status === TaskStatus.DONE

  return (
    <tr className="group cursor-pointer" onClick={() => onEditTask(task)}>
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
        <button
          className="inline-flex size-[26px] items-center justify-center rounded-[6px] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
          type="button"
          onClick={(event) => event.stopPropagation()}
        >
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

function formatShortDate(value: string | null): string {
  if (!value) return 'Sem prazo'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
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
