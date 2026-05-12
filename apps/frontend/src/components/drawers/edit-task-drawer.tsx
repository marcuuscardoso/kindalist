import { CalendarDays, Trash2 } from 'lucide-react'
import { FormEvent, ReactNode, useState } from 'react'
import { taskService } from '@/services/task.service'
import { DashboardListSummary } from '@/types/dashboard'
import { Task, TaskPriority, TaskStatus } from '@/types/task'
import { DrawerField, DrawerShell, drawerInputClass, drawerTextareaClass } from './drawer-shell'

type EditTaskDrawerProps = {
  list: DashboardListSummary
  task: Task
  onClose(): void
  onSaved(task: Task): void
  onDeleted(taskId: string): void
}

const statusOptions = [
  { value: TaskStatus.TODO, label: 'TODO', color: 'hsl(240 4% 60%)' },
  { value: TaskStatus.IN_PROGRESS, label: 'IN PROGRESS', color: 'hsl(38 92% 50%)' },
  { value: TaskStatus.DONE, label: 'DONE', color: 'hsl(142 55% 42%)' },
]

const priorityOptions = [
  { value: TaskPriority.LOW, label: 'Baixa', className: 'text-[#246b3f]' },
  { value: TaskPriority.MEDIUM, label: 'Média', className: 'text-[#7a5520]' },
  { value: TaskPriority.HIGH, label: 'Alta', className: 'text-[#9c2626]' },
]

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'hsl(240 4% 60%)',
  [TaskStatus.IN_PROGRESS]: 'hsl(38 92% 50%)',
  [TaskStatus.DONE]: 'hsl(142 55% 42%)',
}

export function EditTaskDrawer({ list, task, onClose, onSaved, onDeleted }: EditTaskDrawerProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [deadline, setDeadline] = useState(toDateInputValue(task.deadline))
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const updatedTask = await taskService.update(list.id, task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        deadline: deadline ? new Date(`${deadline}T00:00:00.000Z`).toISOString() : null,
      })
      onSaved(updatedTask)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await taskService.delete(list.id, task.id)
      onDeleted(task.id)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DrawerShell
        title="Editar task"
        subtitle={`#${task.id.slice(0, 6).toUpperCase()} · ${list.title}`}
        statusColor={statusColors[status]}
        onClose={onClose}
        footer={
          <>
            <button
              className="mr-auto inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] px-3 text-[13px] font-medium text-[hsl(var(--destructive))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
            >
              <Trash2 size={13} strokeWidth={1.6} />
              Excluir
            </button>
            <button
              className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-3 text-[13px] font-medium transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="inline-flex h-8 items-center justify-center rounded-[6px] bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-fg))] transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        }
      >
        <DrawerField label="Título">
          <input className={drawerInputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
        </DrawerField>

        <DrawerField label="Descrição">
          <textarea
            className={drawerTextareaClass}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </DrawerField>

        <DrawerField label="Status">
          <div className="grid grid-cols-3 gap-0.5 rounded-[6px] bg-[hsl(var(--muted))] p-[3px]">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                className={`inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] text-[12px] font-medium ${
                  status === option.value
                    ? 'bg-[hsl(var(--bg))] text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                    : 'text-[hsl(var(--muted-fg))]'
                }`}
                type="button"
                onClick={() => setStatus(option.value)}
              >
                <span className="size-[7px] rounded-full" style={{ backgroundColor: option.color }} />
                {option.label}
              </button>
            ))}
          </div>
        </DrawerField>

        <DrawerField label="Prioridade">
          <div className="grid grid-cols-3 gap-0.5 rounded-[6px] bg-[hsl(var(--muted))] p-[3px]">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                className={`inline-flex h-[26px] items-center justify-center rounded-[5px] text-[12px] font-medium ${
                  priority === option.value
                    ? 'bg-[hsl(var(--bg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                    : ''
                } ${option.className}`}
                type="button"
                onClick={() => setPriority(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DrawerField>

        <DrawerField label="Prazo">
          <div className="flex gap-2">
            <input
              className={drawerInputClass}
              value={deadline}
              type="date"
              onChange={(event) => setDeadline(event.target.value)}
            />
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-[hsl(var(--border))]">
              <CalendarDays size={15} strokeWidth={1.6} />
            </span>
          </div>
        </DrawerField>

        <div className="mt-3 border-t border-[hsl(var(--border))] py-3">
          <MetaRow label="Lista">
            <span className="inline-flex items-center gap-[6px]">
              <span className="size-2 rounded-full" style={{ backgroundColor: list.color }} />
              {list.title}
            </span>
          </MetaRow>
          <MetaRow label="Criada">
            <span className="font-mono text-[12px] text-[hsl(var(--muted-fg))]">{formatTimestamp(task.createdAt)}</span>
          </MetaRow>
          <MetaRow label="Atualizada">
            <span className="font-mono text-[12px] text-[hsl(var(--muted-fg))]">{formatTimestamp(task.updatedAt)}</span>
          </MetaRow>
        </div>
      </DrawerShell>
    </form>
  )
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-center gap-2 py-[6px] text-[13px]">
      <span className="text-[12.5px] text-[hsl(var(--muted-fg))]">{label}</span>
      <span>{children}</span>
    </div>
  )
}

function toDateInputValue(value: string | null): string {
  if (!value) return ''

  return new Date(value).toISOString().slice(0, 10)
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(value))
    .replace(',', ' ·')
    .replace('.', '')
}
