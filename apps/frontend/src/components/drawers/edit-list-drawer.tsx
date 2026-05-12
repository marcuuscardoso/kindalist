import { Archive, Trash2 } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { listService } from '@/services/list.service'
import { DashboardListSummary } from '@/types/dashboard'
import { DrawerField, DrawerShell, drawerInputClass, drawerTextareaClass } from './drawer-shell'

type EditListDrawerProps = {
  list: DashboardListSummary
  onClose(): void
  onSaved(): Promise<void> | void
}

export function EditListDrawer({ list, onClose, onSaved }: EditListDrawerProps) {
  const [title, setTitle] = useState(list.title)
  const [description, setDescription] = useState(list.description ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await listService.update(list.id, {
        title: title.trim(),
        description: description.trim() || null,
      })
      await onSaved()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleArchive() {
    setIsSubmitting(true)
    try {
      await listService.archive(list.id, { isArchived: true })
      await onSaved()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    setIsSubmitting(true)
    try {
      await listService.delete(list.id)
      await onSaved()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DrawerShell
        title="Editar lista"
        subtitle={`${list.total} tasks · ${list.done} concluídas`}
        statusColor={list.color}
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
              className="inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] px-3 text-[13px] font-medium transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleArchive()}
            >
              <Archive size={13} strokeWidth={1.6} />
              Arquivar
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
              {isSubmitting ? 'Salvando...' : 'Salvar'}
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

        <div className="mt-3 rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--subtle))] p-3 text-[12px] leading-[1.45] text-[hsl(var(--muted-fg))]">
          Arquivar remove a lista da Home e mantém o histórico em Arquivadas. Excluir remove a lista definitivamente.
        </div>
      </DrawerShell>
    </form>
  )
}
