import { Archive, Home, LogOut } from 'lucide-react'
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { routes } from '@/app/routes'
import { useAuth } from '@/hooks/use-auth'
import { AuthUser } from '@/types/auth'
import { DashboardListSummary } from '@/types/dashboard'

type AsideLink = {
  link?: string
  text: string
  icon?: ReactNode
  dotColor?: string
  count?: string
  className?: string
}

type AsideLinks = {
  top: AsideLink[]
  center: AsideLink[]
  bottom: AsideLink[]
}

type AppSidebarProps = {
  user: AuthUser
  lists: DashboardListSummary[]
  archivedCount: number
}

export function AppSidebar({ user, lists, archivedCount }: AppSidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const pageUrl = getCurrentPageUrl(location.pathname)
  const asideLinks = getAsideLinks(lists, archivedCount)

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
        {asideLinks.top.map((link) => (
          <AsideItem key={link.text} link={link} active={pageUrl === link.link} />
        ))}
      </nav>

      <div className="px-2 pb-[6px] pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--muted-fg))]">
        Listas
      </div>
      <nav className="flex flex-col gap-[6px]">
        {asideLinks.center.map((link) => (
          <AsideItem key={link.link} link={link} active={pageUrl === link.link} />
        ))}
      </nav>

      <div className="px-2 pb-[6px] pt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--muted-fg))]">
        Geral
      </div>
      <nav className="flex flex-col gap-[6px]">
        {asideLinks.bottom.map((link) => (
          <AsideItem key={link.text} link={link} active={pageUrl === link.link} />
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-auto flex items-center gap-[9px] rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-2 text-left transition-colors duration-150 hover:border-[hsl(var(--border-strong))]"
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[11px] font-semibold text-white">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium leading-[1.15]">{user.name}</div>
          <div className="truncate text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">{user.email}</div>
        </div>
        <LogOut size={14} strokeWidth={1.6} className="shrink-0 text-[hsl(var(--muted-fg))]" />
      </button>
    </aside>
  )
}

function getAsideLinks(lists: DashboardListSummary[], archivedCount: number): AsideLinks {
  return {
    top: [
      {
        link: routes.app,
        text: 'Home',
        icon: <Home size={15} strokeWidth={1.6} />,
      },
    ],
    center: lists.map((list) => ({
      link: routes.list(list.id),
      text: list.title,
      dotColor: list.color,
      count: String(list.total),
    })),
    bottom: [
      {
        link: routes.archived,
        text: 'Arquivadas',
        icon: <Archive size={15} strokeWidth={1.6} />,
        count: String(archivedCount),
      },
    ],
  }
}

function getCurrentPageUrl(pathname: string): string {
  if (pathname === routes.list()) return routes.app

  return pathname
}

function AsideItem({ link, active }: { link: AsideLink; active: boolean }) {
  const className = `flex min-h-[30px] items-center gap-[9px] rounded-[6px] px-[9px] py-[7px] text-left text-[13.5px] leading-[1.2] transition-colors duration-150 hover:bg-[hsl(var(--accent))] ${link.className ?? ''} ${
        active
          ? 'bg-[hsl(var(--fg)/0.06)] font-medium text-[hsl(var(--fg))]'
          : 'font-normal text-[hsl(var(--muted-fg))]'
      }`
  const content = (
    <>
      {link.icon}
      {link.dotColor && <span className="size-2 rounded-full" style={{ backgroundColor: link.dotColor }} />}
      <span className="truncate">{link.text}</span>
      {link.count && (
        <span className="ml-auto rounded-full bg-[hsl(var(--muted))] px-[7px] py-px font-mono text-[11px] leading-[1.4] text-[hsl(var(--muted-fg))]">
          {link.count}
        </span>
      )}
    </>
  )

  if (link.link) {
    return (
      <Link className={className} to={link.link}>
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
