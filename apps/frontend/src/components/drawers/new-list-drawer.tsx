import { Archive, Columns3, LayoutList } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { listService } from '@/services/list.service'
import { DrawerField, DrawerShell, drawerInputClass, drawerTextareaClass } from './drawer-shell'

type NewListDrawerProps = {
  onClose(): void
  onCreated(): Promise<void>
}

export function NewListDrawer({ onClose, onCreated }: NewListDrawerProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [defaultView, setDefaultView] = useState<'list' | 'board'>('list')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await listService.create({
        title: title.trim(),
        description: description.trim() || null,
      })
      await onCreated()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DrawerShell
        title="Nova lista"
        onClose={onClose}
        footer={
          <>
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
              {isSubmitting ? 'Criando...' : 'Criar lista'}
            </button>
          </>
        }
      >
        <DrawerField label="Título">
          <input
            className={drawerInputClass}
            value={title}
            placeholder="Ex: Mudança de apto"
            onChange={(event) => setTitle(event.target.value)}
          />
        </DrawerField>

        <DrawerField label="Descrição">
          <textarea
            className={drawerTextareaClass}
            rows={3}
            value={description}
            placeholder="Opcional. Pra você lembrar pra que serve daqui a 3 semanas."
            onChange={(event) => setDescription(event.target.value)}
          />
        </DrawerField>

        <DrawerField label="Visualização padrão">
          <div className="grid grid-cols-2 gap-0.5 rounded-[6px] bg-[hsl(var(--muted))] p-[3px]">
            <button
              className={`inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] text-[12.5px] font-medium ${
                defaultView === 'list'
                  ? 'bg-[hsl(var(--bg))] text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                  : 'text-[hsl(var(--muted-fg))]'
              }`}
              type="button"
              onClick={() => setDefaultView('list')}
            >
              <LayoutList size={13} strokeWidth={1.6} />
              Lista
            </button>
            <button
              className={`inline-flex h-[26px] items-center justify-center gap-[6px] rounded-[5px] text-[12.5px] font-medium ${
                defaultView === 'board'
                  ? 'bg-[hsl(var(--bg))] text-[hsl(var(--fg))] shadow-[0_1px_2px_hsl(0_0%_0%/0.06)]'
                  : 'text-[hsl(var(--muted-fg))]'
              }`}
              type="button"
              onClick={() => setDefaultView('board')}
            >
              <Columns3 size={13} strokeWidth={1.6} />
              Board
            </button>
          </div>
        </DrawerField>

        <div className="mt-[14px] flex gap-[10px] rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--subtle))] p-3 text-[12px] leading-[1.45] text-[hsl(var(--muted-fg))]">
          <Archive size={14} strokeWidth={1.6} className="mt-px shrink-0" />
          <span>Você pode arquivar a lista a qualquer momento. Nada se perde — só some dos filtros principais.</span>
        </div>
      </DrawerShell>
    </form>
  )
}
