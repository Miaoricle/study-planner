import { ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, Play } from 'lucide-react'
import { COLORS, type Assignment, type ClassSlot, type FocusSession } from '../types'
import { addDays, DAYS_SHORT, daysUntil, dueLabel, formatTime, isoDate, nowMinutes, startOfWeek, toMinutes, weekdayIndex } from '../lib/date'
import { formatClock, MODE_LABEL, type FocusTimer } from '../lib/useFocusTimer'
import { sampleData } from '../lib/sample'
import { EmptyState, PriorityBadge } from './ui'
import type { TabId } from '../App'

type Props = {
  classes: ClassSlot[]
  assignments: Assignment[]
  sessions: FocusSession[]
  timer: FocusTimer
  setTab: (t: TabId) => void
  onLoadSample: (d: ReturnType<typeof sampleData>) => void
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard({ classes, assignments, sessions, timer, setTab, onLoadSample }: Props) {
  const today = weekdayIndex()
  const now = nowMinutes()
  const todays = classes.filter((c) => c.day === today).sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  const nextIdx = todays.findIndex((c) => toMinutes(c.end) > now)

  const pending = assignments.filter((a) => !a.done).sort((a, b) => a.due.localeCompare(b.due))
  const dueSoon = pending.filter((a) => daysUntil(a.due) <= 7)
  const overdue = pending.filter((a) => daysUntil(a.due) < 0).length

  // focus minutes per day this week
  const monday = startOfWeek()
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = isoDate(addDays(monday, i))
    const minutes = sessions.filter((s) => isoDate(new Date(s.endedAt)) === key).reduce((sum, s) => sum + s.minutes, 0)
    return { label: DAYS_SHORT[i], minutes, isToday: i === today }
  })
  const weekTotal = week.reduce((s, d) => s + d.minutes, 0)
  const todayMinutes = week[today].minutes
  const maxDay = Math.max(60, ...week.map((d) => d.minutes))

  const isEmpty = classes.length === 0 && assignments.length === 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-500 dark:text-paper-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{greeting()}.</h1>
        <p className="mt-1 text-paper-500 dark:text-paper-400">
          {todays.length} {todays.length === 1 ? 'class' : 'classes'} today · {dueSoon.length} due this week
          {overdue > 0 && <span className="font-semibold text-tomato-600 dark:text-tomato-400"> · {overdue} overdue</span>}
        </p>
      </div>

      {isEmpty && (
        <div className="card flex flex-col items-start gap-4 border-l-4 border-l-tomato-500 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-semibold">New here? Start with your timetable.</p>
            <p className="text-sm text-paper-500 dark:text-paper-400">
              Add your classes and deadlines, or load sample data to look around first. Everything stays in this browser.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => onLoadSample(sampleData())}>
              Load sample
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setTab('timetable')}>
              Add classes
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's classes */}
        <section className="card p-5 lg:col-span-2" aria-labelledby="today-classes">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="today-classes" className="font-semibold">Today's classes</h2>
            <button type="button" className="btn btn-ghost px-2! py-1! text-xs" onClick={() => setTab('timetable')}>
              Full timetable <ArrowRight className="size-3.5" />
            </button>
          </div>
          {todays.length === 0 ? (
            <EmptyState icon={<CalendarDays className="size-8" />} title="No classes today">
              A good day for revision or catching up on assignments.
            </EmptyState>
          ) : (
            <ol className="space-y-2.5">
              {todays.map((c, i) => {
                const live = toMinutes(c.start) <= now && now < toMinutes(c.end)
                const past = toMinutes(c.end) <= now
                const color = COLORS[c.color]
                return (
                  <li
                    key={c.id}
                    className={`flex items-center gap-4 rounded-md border-l-4 p-3 ${color.border} ${color.soft} ${past ? 'opacity-50' : ''}`}
                  >
                    <div className="w-20 shrink-0 text-sm tabular-nums">
                      <p className="font-semibold">{formatTime(c.start)}</p>
                      <p className="text-paper-500 dark:text-paper-400">{formatTime(c.end)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{c.subject}</p>
                      {c.location && (
                        <p className="flex items-center gap-1 text-sm text-paper-500 dark:text-paper-400">
                          <MapPin className="size-3.5" /> {c.location}
                        </p>
                      )}
                    </div>
                    {live && <span className="rounded-full bg-[#5f7a52] px-2 py-0.5 text-xs font-semibold text-paper-50">Now</span>}
                    {!live && i === nextIdx && <span className="rounded-full border border-paper-900 px-2 py-0.5 text-xs font-semibold dark:border-paper-200">Next</span>}
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        {/* Focus */}
        <section className="card flex flex-col p-5" aria-labelledby="focus-card">
          <h2 id="focus-card" className="font-semibold">Focus this week</h2>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {Math.floor(weekTotal / 60)}h {weekTotal % 60}m
          </p>
          <p className="text-sm text-paper-500 dark:text-paper-400">{todayMinutes} min today</p>

          <div className="mt-4 flex h-24 items-end gap-1.5" role="img" aria-label={`Focus minutes per day: ${week.map((d) => `${d.label} ${d.minutes}`).join(', ')}`}>
            {week.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-md ${d.isToday ? 'bg-tomato-500' : 'bg-paper-300 dark:bg-paper-700'}`}
                  style={{ height: `${Math.max(4, (d.minutes / maxDay) * 72)}px` }}
                  title={`${d.minutes} min`}
                />
                <span className={`text-[0.65rem] ${d.isToday ? 'font-bold' : 'text-paper-500'}`}>{d.label}</span>
              </div>
            ))}
          </div>

          <button type="button" className="btn btn-primary mt-auto w-full" style={{ marginTop: '1.25rem' }} onClick={() => { if (timer.status !== 'running') timer.start(); setTab('focus') }}>
            {timer.status === 'running' ? (
              <>
                <Clock className="size-4" /> {MODE_LABEL[timer.mode]} · {formatClock(timer.left)}
              </>
            ) : (
              <>
                <Play className="size-4" /> Start a focus session
              </>
            )}
          </button>
        </section>
      </div>

      {/* Deadlines */}
      <section className="card p-5" aria-labelledby="due-soon">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="due-soon" className="font-semibold">Due in the next 7 days</h2>
          <button type="button" className="btn btn-ghost px-2! py-1! text-xs" onClick={() => setTab('assignments')}>
            All assignments <ArrowRight className="size-3.5" />
          </button>
        </div>
        {dueSoon.length === 0 ? (
          <EmptyState icon={<CheckCircle2 className="size-8" />} title="Nothing due this week">
            Enjoy it while it lasts.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-paper-100 dark:divide-paper-800">
            {dueSoon.map((a) => {
              const n = daysUntil(a.due)
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-paper-500 dark:text-paper-400">{a.subject || 'No subject'}</p>
                  </div>
                  <PriorityBadge priority={a.priority} />
                  <span
                    className={`text-sm font-semibold ${n < 0 ? 'text-tomato-600 dark:text-tomato-400' : n <= 1 ? 'text-[#a87f1c] dark:text-[#d8b45a]' : 'text-paper-500'}`}
                  >
                    {dueLabel(a.due)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
