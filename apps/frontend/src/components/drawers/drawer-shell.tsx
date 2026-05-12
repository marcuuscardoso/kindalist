import { X } from 'lucide-react'
import { ReactNode } from 'react'

type DrawerShellProps = {
  title: string
  subtitle?: ReactNode
  statusColor?: string
  children: ReactNode
  footer: ReactNode
  onClose(): void
}

export function DrawerShell({ title, subtitle, statusColor, children, footer, onClose }: DrawerShellProps) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-[hsl(240_10%_6%/0.5)] backdrop-blur-[2px]"
        type="button"
        aria-label="Fechar"
        onClick={onClose}
      />
      <aside className="absolute bottom-0 right-0 top-0 z-[51] flex w-[440px] flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--bg))] shadow-[-8px_0_24px_hsl(0_0%_0%/0.12)]">
        <header className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-5 py-4">
          {statusColor && <span className="size-2 rounded-full" style={{ backgroundColor: statusColor }} />}
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold leading-[1.35] tracking-[-0.01em]">{title}</h3>
            {subtitle && (
              <div className="mt-px font-mono text-[12px] leading-[1.4] text-[hsl(var(--muted-fg))]">{subtitle}</div>
            )}
          </div>
          <button
            className="inline-flex size-7 items-center justify-center rounded-[6px] text-[hsl(var(--fg))] transition-colors duration-150 hover:bg-[hsl(var(--muted))]"
            type="button"
            onClick={onClose}
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-[14px] overflow-auto p-5">{children}</div>

        <footer className="flex justify-end gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--subtle))] px-5 py-[14px]">
          {footer}
        </footer>
      </aside>
    </div>
  )
}

export function DrawerField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12.5px] font-medium leading-[1.45]">{label}</span>
      {children}
    </label>
  )
}

export const drawerInputClass =
  'h-9 w-full rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--bg))] px-[11px] text-[13px] leading-[1.45] text-[hsl(var(--fg))] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[hsl(var(--fg)/0.5)] focus:shadow-[0_0_0_3px_hsl(var(--fg)/0.08)]'

export const drawerTextareaClass =
  'min-h-[72px] w-full resize-none rounded-[6px] border border-[hsl(var(--input))] bg-[hsl(var(--bg))] px-[11px] py-[9px] text-[13px] leading-[1.45] text-[hsl(var(--fg))] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[hsl(var(--fg)/0.5)] focus:shadow-[0_0_0_3px_hsl(var(--fg)/0.08)]'
