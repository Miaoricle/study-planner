export const COLORS = {
  // Keys are stored in saved timetables, so they stay the same; only the look changes.
  indigo: { name: 'Ink blue', dot: 'bg-[#3d5a73]', soft: 'bg-[#3d5a73]/8 dark:bg-[#7d9bb5]/12', border: 'border-l-[#3d5a73] dark:border-l-[#7d9bb5]', text: 'text-[#3d5a73] dark:text-[#9db5ca]' },
  emerald: { name: 'Sage', dot: 'bg-[#5f7a52]', soft: 'bg-[#5f7a52]/8 dark:bg-[#93ad84]/12', border: 'border-l-[#5f7a52] dark:border-l-[#93ad84]', text: 'text-[#4d6642] dark:text-[#a9c09b]' },
  amber: { name: 'Mustard', dot: 'bg-[#c49a2c]', soft: 'bg-[#c49a2c]/10 dark:bg-[#d8b45a]/12', border: 'border-l-[#c49a2c] dark:border-l-[#d8b45a]', text: 'text-[#8a6a18] dark:text-[#dfc077]' },
  rose: { name: 'Tomato', dot: 'bg-tomato-500', soft: 'bg-tomato-500/8 dark:bg-tomato-400/12', border: 'border-l-tomato-500 dark:border-l-tomato-400', text: 'text-tomato-700 dark:text-tomato-300' },
  sky: { name: 'Teal', dot: 'bg-[#2f7a78]', soft: 'bg-[#2f7a78]/8 dark:bg-[#6fb0ad]/12', border: 'border-l-[#2f7a78] dark:border-l-[#6fb0ad]', text: 'text-[#25615f] dark:text-[#8cc4c1]' },
  violet: { name: 'Plum', dot: 'bg-[#7a4a68]', soft: 'bg-[#7a4a68]/8 dark:bg-[#b48aa4]/12', border: 'border-l-[#7a4a68] dark:border-l-[#b48aa4]', text: 'text-[#6a3f5a] dark:text-[#c9a3bb]' },
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
