import type { ReactNode } from 'react'
import type { Priority } from '../types'

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-paper-500 dark:text-paper-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-paper-300 px-6 py-10 text-center dark:border-paper-700">
      <div className="mb-3 text-paper-400">{icon}</div>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-paper-500 dark:text-paper-400">{children}</div>}
    </div>
  )
}

const PRIORITY_STYLE: Record<Priority, string> = {
  high: 'bg-tomato-100 text-tomato-800 dark:bg-tomato-500/15 dark:text-tomato-300',
  medium: 'bg-[#c49a2c]/15 text-[#7a5c12] dark:bg-[#d8b45a]/15 dark:text-[#dfc077]',
  low: 'bg-paper-200/70 text-paper-600 dark:bg-paper-800 dark:text-paper-300',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold capitalize ${PRIORITY_STYLE[priority]}`}>
      {priority}
    </span>
  )
}
