export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** 0 = Monday … 6 = Sunday */
export const weekdayIndex = (d = new Date()) => (d.getDay() + 6) % 7

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const nowMinutes = (d = new Date()) => d.getHours() * 60 + d.getMinutes()

/** Local date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export const isoDate = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const addDays = (d: Date, n: number) => {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

/** Whole days from today to a YYYY-MM-DD date (negative = past). */
export const daysUntil = (due: string, today = new Date()) => {
  const [y, m, d] = due.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

export const dueLabel = (due: string) => {
  const n = daysUntil(due)
  if (n < -1) return `${-n} days overdue`
  if (n === -1) return 'Due yesterday'
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  if (n < 7) return `Due in ${n} days`
  return `Due ${formatDate(due)}`
}

export const formatDate = (due: string) => {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** Monday of the week containing d. */
export const startOfWeek = (d = new Date()) => {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return addDays(c, -weekdayIndex(c))
}
