import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import type { FocusSession, Settings } from '../types'
import { isoDate } from '../lib/date'
import { formatClock, MODE_LABEL, type FocusTimer, type TimerMode } from '../lib/useFocusTimer'
import { PageTitle } from './ui'

type Props = {
  timer: FocusTimer
  sessions: FocusSession[]
  settings: Settings
  setSettings: (fn: (s: Settings) => Settings) => void
  subjects: string[]
  subject: string
  setSubject: (s: string) => void
}

const RING = 2 * Math.PI * 120

export function Focus({ timer, sessions, settings, setSettings, subjects, subject, setSubject }: Props) {
  const progress = 1 - timer.left / timer.total
  const today = isoDate()
  const todays = sessions.filter((s) => isoDate(new Date(s.endedAt)) === today)
  const todayMinutes = todays.reduce((s, x) => s + x.minutes, 0)
  const recent = [...sessions].reverse().slice(0, 6)
  const isBreak = timer.mode !== 'focus'
  const stroke = isBreak ? 'stroke-[#5f7a52] dark:stroke-[#93ad84]' : 'stroke-tomato-600 dark:stroke-tomato-400'

  const numberField = (key: keyof Omit<Settings, 'sound'>, label: string, max: number) => (
    <label key={key}>
      <span className="label">{label}</span>
      <input
        type="number"
        min={1}
        max={max}
        className="input"
        value={settings[key]}
        disabled={timer.status !== 'idle'}
        onChange={(e) => {
          const v = Math.min(max, Math.max(1, Number(e.target.value) || 1))
          setSettings((s) => ({ ...s, [key]: v }))
        }}
      />
    </label>
  )

  return (
    <div>
      <PageTitle title="Focus timer" subtitle="Pomodoro: focus in short sprints, rest in between." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card flex flex-col items-center p-6 sm:p-8" aria-label="Timer">
          <div className="flex gap-1 rounded-md bg-paper-200/70 p-1 dark:bg-paper-800" role="tablist" aria-label="Timer mode">
            {(['focus', 'short', 'long'] as TimerMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={timer.mode === m}
                onClick={() => timer.switchMode(m)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${timer.mode === m ? 'bg-paper-50 dark:bg-paper-950' : 'text-paper-500 hover:text-paper-900 dark:hover:text-paper-50'}`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <div className="relative my-8 size-64 sm:size-72">
            <svg viewBox="0 0 260 260" className="size-full -rotate-90">
              <circle cx="130" cy="130" r="120" fill="none" strokeWidth="10" className="stroke-paper-200 dark:stroke-paper-800" />
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={`${stroke} transition-[stroke-dashoffset] duration-300`}
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - progress)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-serif text-6xl font-semibold tabular-nums sm:text-7xl" aria-live="off">
                {formatClock(timer.left)}
              </p>
              <p className={`mt-1 text-sm font-semibold uppercase tracking-wide ${isBreak ? 'text-[#5f7a52] dark:text-[#93ad84]' : 'text-tomato-600 dark:text-tomato-400'}`}>
                {timer.status === 'paused' ? 'Paused' : MODE_LABEL[timer.mode]}
              </p>
              <p className="mt-2 text-xs text-paper-500">
                Session {(timer.cycle % settings.longEvery) + (timer.mode === 'focus' ? 1 : 0) || settings.longEvery} of {settings.longEvery}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-ghost size-11 p-0! rounded-full!" onClick={timer.reset} aria-label="Reset timer" disabled={timer.status === 'idle'}>
              <RotateCcw className="size-5" />
            </button>
            {timer.status === 'running' ? (
              <button type="button" className="btn btn-primary h-14 min-w-36 rounded-full! text-base" onClick={timer.pause}>
                <Pause className="size-5" /> Pause
              </button>
            ) : (
              <button type="button" className="btn btn-primary h-14 min-w-36 rounded-full! text-base" onClick={timer.start}>
                <Play className="size-5" /> {timer.status === 'paused' ? 'Resume' : 'Start'}
              </button>
            )}
            <button type="button" className="btn btn-ghost size-11 p-0! rounded-full!" onClick={timer.skip} aria-label="Skip to next session">
              <SkipForward className="size-5" />
            </button>
          </div>

          <label className="mt-8 w-full max-w-xs">
            <span className="label text-center">Working on</span>
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">General study</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-semibold">Today</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-tomato-50 p-3 dark:bg-tomato-500/10">
                <p className="text-2xl font-bold tabular-nums">{todays.length}</p>
                <p className="text-xs text-paper-500">sessions</p>
              </div>
              <div className="rounded-md bg-[#5f7a52]/10 p-3 dark:bg-[#93ad84]/12">
                <p className="text-2xl font-bold tabular-nums">{todayMinutes}</p>
                <p className="text-xs text-paper-500">minutes focused</p>
              </div>
            </div>
            {recent.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm">
                {recent.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span className="truncate">{s.subject || 'General study'}</span>
                    <span className="shrink-0 tabular-nums text-paper-500">
                      {s.minutes} min ·{' '}
                      {new Date(s.endedAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Timer settings</h2>
            {timer.status !== 'idle' && <p className="mt-1 text-xs text-paper-500">Reset the timer to change durations.</p>}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {numberField('focus', 'Focus (min)', 120)}
              {numberField('shortBreak', 'Short break', 30)}
              {numberField('longBreak', 'Long break', 60)}
              {numberField('longEvery', 'Long break every', 10)}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-tomato-500" checked={settings.sound} onChange={(e) => setSettings((s) => ({ ...s, sound: e.target.checked }))} />
              Play a sound when a session ends
            </label>
          </section>
        </div>
      </div>
    </div>
  )
}
