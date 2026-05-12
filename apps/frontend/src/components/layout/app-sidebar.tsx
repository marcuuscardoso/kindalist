import { Archive, ChevronDown, Home, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { routes } from '@/app/routes'
import { AuthUser } from '@/types/auth'
import { DashboardListSummary } from '@/types/dashboard'

type AppSidebarProps = {
  user: AuthUser
  lists: DashboardListSummary[]
  archivedCount: number
}

export function AppSidebar({ user, lists, archivedCount }: AppSidebarProps) {
  const { listId } = useParams()
  const location = useLocation()
  const isHomeActive = location.pathname === routes.app || location.pathname === routes.list()

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col gap-[6px] border-r border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-3 pb-3 pt-4">
      <div className="mb-[10px] flex items-center gap-[9px] border-b border-[hsl(var(--border))] px-2 pb-[14px] pt-1">
        <div className="flex size-7 items-center justify-center rounded-[7px] bg-[hsl(var(--primary))] text-[13px] font-semibold tracking-[-0.5px] text-[hsl(var(--primary-fg))]">
          k.
        </div>
        <div>
          <div className="text-[14.5px] font-semibold leading-[1.3] tracking-[-0.02em]">Kinda List</div>
          <div className="mt-px font-mono text-[11px] font-semibold leading-[1.4] tracking-[0] text-[hsl(var(--muted-fg))]">
            tasks, sort of.
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-[6px]">
        <SideItem active={isHomeActive} to={routes.app} icon={<Home size={15} strokeWidth={1.6} />} label="Home" />
      </nav>

      <div className="px-2 pb-[6px] pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--muted-fg))]">
        Listas
      </div>
      <nav className="flex flex-col gap-[6px]">
        {lists.map((list) => (
          <SideItem
            key={list.id}
            active={list.id === listId}
            muted={list.id !== listId}
            to={routes.list(list.id)}
            dotColor={list.color}
            label={list.title}
            count={String(list.total)}
          />
        ))}
      </nav>

      <div className="px-2 pb-[6px] pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--muted-fg))]">
        Geral
      </div>
      <nav className="flex flex-col gap-[6px]">
        <SideItem muted icon={<Archive size={15} strokeWidth={1.6} />} label="Arquivadas" count={String(archivedCount)} />
        <SideItem muted icon={<Settings size={15} strokeWidth={1.6} />} label="Configurações" />
      </nav>

      <button className="mt-auto flex items-center gap-[9px] rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-2 text-left transition-colors duration-150 hover:border-[hsl(var(--border-strong))]">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[11px] font-semibold text-white">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium leading-[1.15]">{user.name}</div>
          <div className="truncate text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">{user.email}</div>
        </div>
        <ChevronDown size={14} strokeWidth={1.6} className="shrink-0 text-[hsl(var(--muted-fg))]" />
      </button>
    </aside>
  )
}

type SideItemProps = {
  label: string
  to?: string
  icon?: ReactNode
  dotColor?: string
  count?: string
  active?: boolean
  muted?: boolean
}

function SideItem({ label, to, icon, dotColor, count, active = false, muted = false }: SideItemProps) {
  const className = `flex min-h-[30px] items-center gap-[9px] rounded-[6px] px-[9px] py-[7px] text-left text-[13.5px] leading-[1.2] transition-colors duration-150 hover:bg-[hsl(var(--accent))] ${
        active
          ? 'bg-[hsl(var(--fg)/0.06)] font-medium text-[hsl(var(--fg))]'
          : muted
            ? 'font-normal text-[hsl(var(--muted-fg))]'
            : 'font-[450] text-[hsl(var(--fg))]'
      }`
  const content = (
    <>
      {icon}
      {dotColor && <span className="size-2 rounded-full" style={{ backgroundColor: dotColor }} />}
      <span className="truncate">{label}</span>
      {count && (
        <span className="ml-auto rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {count}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link className={className} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} type="button">
      {content}
    </button>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const [firstName, lastName] = [parts[0], parts.at(-1)]

  return `${firstName?.[0] ?? ''}${lastName && lastName !== firstName ? lastName[0] : ''}`.toUpperCase()
}
