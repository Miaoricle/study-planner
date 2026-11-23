export const COLORS = {
  indigo: { dot: 'bg-indigo-500', soft: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-l-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  emerald: { dot: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-l-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  amber: { dot: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-l-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  rose: { dot: 'bg-rose-500', soft: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-l-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  sky: { dot: 'bg-sky-500', soft: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-l-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  violet: { dot: 'bg-violet-500', soft: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-l-violet-500', text: 'text-violet-700 dark:text-violet-300' },
} as const

export type ColorKey = keyof typeof COLORS

/** day: 0 = Monday … 6 = Sunday. Times are "HH:MM" (24h). */
export type ClassSlot = {
  id: string
  subject: string
  day: number
  start: string
  end: string
  location: string
  color: ColorKey
}

export type Priority = 'low' | 'medium' | 'high'

export type Assignment = {
  id: string
  title: string
  subject: string
  due: string // YYYY-MM-DD
  priority: Priority
  done: boolean
  createdAt: string
}

export type FocusSession = {
  id: string
  subject: string
  minutes: number
  endedAt: string // ISO timestamp
}

export type Settings = {
  focus: number
  shortBreak: number
  longBreak: number
  longEvery: number
  sound: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longEvery: 4,
  sound: true,
}

export type PlannerData = {
  classes: ClassSlot[]
  assignments: Assignment[]
  sessions: FocusSession[]
  settings: Settings
}
