import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { routes } from '@/app/routes'
import { EditListDrawer } from '@/components/drawers/edit-list-drawer'
import { NewListDrawer } from '@/components/drawers/new-list-drawer'
import { AppLayoutContext, DashboardListSummary } from '@/types/dashboard'

export function DashboardPage() {
  const { lists, isLoading, error, reloadLayoutData } = useOutletContext<AppLayoutContext>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [isNewListDrawerOpen, setIsNewListDrawerOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<DashboardListSummary | null>(null)

  const visibleLists = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return lists

    return lists.filter((list) => {
      const title = list.title.toLowerCase()
      const description = list.description?.toLowerCase() ?? ''

      return title.includes(query) || description.includes(query) || list.searchContent.includes(query)
    })
  }, [lists, search])

  const totalTasks = lists.reduce((total, list) => total + list.total, 0)

  return (
    <>
      <Topbar search={search} onSearchChange={setSearch} onCreateList={() => setIsNewListDrawerOpen(true)} />
      <section className="flex-1 overflow-auto px-7 pb-8 pt-6">
        <div className="mb-5 flex items-end gap-4">
          <div>
            <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">Minhas listas</h1>
            <p className="mt-1 text-[13px] leading-[1.45] text-[hsl(var(--muted-fg))]">
              Tudo que você está tentando lembrar, organizado mais ou menos.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-end font-mono text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {lists.length} listas · {totalTasks} tasks
        </div>

        {isLoading && <DashboardMessage>Carregando listas...</DashboardMessage>}
        {error && <DashboardMessage>{error}</DashboardMessage>}

        {!isLoading && !error && (
          <div className="grid grid-cols-3 gap-[14px]">
            {visibleLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpenList={(listId) => navigate(routes.list(listId))}
                onEditList={setSelectedList}
              />
            ))}
            <NewListCard onClick={() => setIsNewListDrawerOpen(true)} />
          </div>
        )}
      </section>
      {isNewListDrawerOpen && (
        <NewListDrawer onClose={() => setIsNewListDrawerOpen(false)} onCreated={reloadLayoutData} />
      )}
      {selectedList && (
        <EditListDrawer
          list={selectedList}
          onClose={() => setSelectedList(null)}
          onSaved={async () => {
            await reloadLayoutData()
            setSelectedList(null)
          }}
        />
      )}
    </>
  )
}

type TopbarProps = {
  search: string
  onSearchChange(search: string): void
  onCreateList(): void
}

function Topbar({ search, onSearchChange, onCreateList }: TopbarProps) {
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
      <button
        className="ml-auto inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] bg-[hsl(var(--primary))] px-3 text-[13px] font-medium text-[hsl(var(--primary-fg))] transition-opacity duration-150 hover:opacity-90"
        type="button"
        onClick={onCreateList}
      >
        <Plus size={14} strokeWidth={1.6} />
        Nova lista
      </button>
    </header>
  )
}

function DashboardMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-[132px] items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--border-strong))] text-[13px] text-[hsl(var(--muted-fg))]">
      {children}
    </div>
  )
}

function ListCard({
  list,
  onOpenList,
  onEditList,
}: {
  list: DashboardListSummary
  onOpenList(listId: string): void
  onEditList(list: DashboardListSummary): void
}) {
  const percent = list.total > 0 ? Math.round((list.done / list.total) * 100) : 0

  return (
    <article
      className="flex min-h-[132px] flex-col gap-[10px] rounded-[8px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition-[border-color,transform] duration-150 hover:border-[hsl(var(--border-strong))]"
      role="button"
      tabIndex={0}
      onClick={() => onOpenList(list.id)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return

        event.preventDefault()
        onOpenList(list.id)
      }}
    >
      <div className="flex items-start gap-[10px]">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[14px] font-semibold text-white"
          style={{ backgroundColor: list.color }}
        >
          {list.title[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold leading-[1.35] tracking-[-0.01em]">{list.title}</h3>
          <p className="line-clamp-2 text-[12.5px] leading-[1.4] text-[hsl(var(--muted-fg))]">
            {list.description ?? 'Sem descrição.'}
          </p>
        </div>
        <button
          className="flex size-[26px] shrink-0 items-center justify-center rounded-[6px] text-[hsl(var(--muted-fg))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEditList(list)
          }}
        >
          <MoreHorizontal size={14} strokeWidth={1.6} />
        </button>
      </div>

      <div className="mt-auto flex items-center gap-[10px] font-mono text-[11.5px] leading-[1.4] text-[hsl(var(--muted-fg))]">
        <span>
          {list.done}/{list.total}
        </span>
        <span className="h-1 flex-1 rounded-sm bg-[hsl(var(--muted))]">
          <span
            className="block h-full rounded-sm bg-[hsl(var(--fg)/0.55)]"
            style={{ width: `${percent}%` }}
          />
        </span>
        <span>{percent}%</span>
      </div>
    </article>
  )
}

function NewListCard({ onClick }: { onClick(): void }) {
  return (
    <button
      className="flex min-h-[132px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[hsl(var(--border-strong))] bg-transparent p-4 text-center text-[hsl(var(--muted-fg))] transition-colors duration-150 hover:bg-[hsl(var(--subtle))]"
      type="button"
      onClick={onClick}
    >
      <span className="mb-[6px] flex size-8 items-center justify-center rounded-[7px] border border-dashed border-[hsl(var(--border-strong))]">
        <Plus size={14} strokeWidth={1.6} />
      </span>
      <span className="text-[13.5px] font-medium leading-[1.35] text-[hsl(var(--fg))]">Nova lista</span>
      <span className="mt-2 text-[11.5px] leading-[1.4]">Comece com uma ideia vaga, refine depois.</span>
    </button>
  )
}
