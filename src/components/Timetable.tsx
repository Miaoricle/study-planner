import { useState, type FormEvent } from 'react'
import { CalendarPlus, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import { COLORS, type ClassSlot, type ColorKey } from '../types'
import { DAYS, DAYS_SHORT, formatTime, toMinutes, weekdayIndex } from '../lib/date'
import { uid } from '../lib/storage'
import { EmptyState, PageTitle } from './ui'

type Props = { classes: ClassSlot[]; setClasses: (fn: (c: ClassSlot[]) => ClassSlot[]) => void }

type Draft = Omit<ClassSlot, 'id'> & { id?: string }

const blank = (day = weekdayIndex() > 4 ? 0 : weekdayIndex()): Draft => ({
  subject: '',
  day,
  start: '09:00',
  end: '10:00',
  location: '',
  color: 'indigo',
})

export function Timetable({ classes, setClasses }: Props) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')
  const today = weekdayIndex()

  const hasWeekend = classes.some((c) => c.day >= 5)
  const days = hasWeekend ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4]

  function save(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.subject.trim()) return setError('Give the class a name.')
    if (toMinutes(draft.end) <= toMinutes(draft.start)) return setError('End time must be after the start time.')
    const clean = { ...draft, subject: draft.subject.trim(), location: draft.location.trim() }
    if (clean.id) setClasses((cs) => cs.map((c) => (c.id === clean.id ? (clean as ClassSlot) : c)))
    else setClasses((cs) => [...cs, { ...clean, id: uid() }])
    setDraft(null)
    setError('')
  }

  // reuse the colour already chosen for a subject
  function setSubject(subject: string) {
    const existing = classes.find((c) => c.subject.toLowerCase() === subject.trim().toLowerCase())
    setDraft((d) => d && { ...d, subject, color: existing && !d.id ? existing.color : d.color })
  }

  const subjects = [...new Set(classes.map((c) => c.subject))]

  return (
    <div>
      <PageTitle
        title="Weekly timetable"
        subtitle={`${classes.length} ${classes.length === 1 ? 'class' : 'classes'} a week`}
        action={
          <button type="button" className="btn btn-primary" onClick={() => setDraft(blank())}>
            <Plus className="size-4" /> Add class
          </button>
        }
      />

      {draft && (
        <form onSubmit={save} className="card mb-6 space-y-4 p-5" aria-label={draft.id ? 'Edit class' : 'Add class'}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{draft.id ? 'Edit class' : 'New class'}</h2>
            <button type="button" className="btn btn-ghost p-1.5!" onClick={() => setDraft(null)} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="sm:col-span-2">
              <span className="label">Subject</span>
              <input className="input" list="subject-list" value={draft.subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures" autoFocus />
              <datalist id="subject-list">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label className="sm:col-span-2">
              <span className="label">Location</span>
              <input className="input" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Lab 2 (optional)" />
            </label>
            <label>
              <span className="label">Day</span>
              <select className="input" value={draft.day} onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })}>
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Start</span>
              <input type="time" className="input" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} required />
            </label>
            <label>
              <span className="label">End</span>
              <input type="time" className="input" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} required />
            </label>
            <fieldset>
              <legend className="label">Colour</legend>
              <div className="flex gap-2 pt-1.5">
                {(Object.keys(COLORS) as ColorKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDraft({ ...draft, color: k })}
                    aria-label={COLORS[k].name}
                    aria-pressed={draft.color === k}
                    className={`size-6 rounded-full ${COLORS[k].dot} ring-offset-2 ring-offset-white dark:ring-offset-paper-900 ${draft.color === k ? 'ring-2 ring-paper-900 dark:ring-white' : ''}`}
                  />
                ))}
              </div>
            </fieldset>
          </div>
          {error && <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {draft.id ? 'Save changes' : 'Add class'}
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 && !draft ? (
        <EmptyState icon={<CalendarPlus className="size-8" />} title="Your week is empty">
          Add your first class to build your timetable.
        </EmptyState>
      ) : (
        <div className={`grid gap-4 sm:grid-cols-2 ${hasWeekend ? 'lg:grid-cols-7' : 'lg:grid-cols-5'}`}>
          {days.map((d) => {
            const list = classes.filter((c) => c.day === d).sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
            const isToday = d === today
            return (
              <section key={d} aria-label={DAYS[d]} className={`rounded-lg p-3 ${isToday ? 'bg-paper-50 ring-1 ring-tomato-500 dark:bg-paper-900' : 'bg-paper-100/70 dark:bg-paper-900/60'}`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-semibold">
                    <span className="lg:hidden">{DAYS[d]}</span>
                    <span className="hidden lg:inline">{DAYS_SHORT[d]}</span>
                  </h2>
                  {isToday && <span className="text-xs font-bold uppercase text-tomato-600 dark:text-tomato-400">Today</span>}
                </div>
                <ul className="space-y-2">
                  {list.map((c) => (
                    <li key={c.id} className={`group card border-l-4 p-3 ${COLORS[c.color].border}`}>
                      <p className="text-xs font-semibold tabular-nums text-paper-500 dark:text-paper-400">
                        {formatTime(c.start)} – {formatTime(c.end)}
                      </p>
                      <p className="mt-0.5 font-semibold leading-snug">{c.subject}</p>
                      {c.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-paper-500 dark:text-paper-400">
                          <MapPin className="size-3" /> {c.location}
                        </p>
                      )}
                      <div className="mt-2 flex gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                        <button type="button" className="btn btn-ghost p-1!" onClick={() => { setDraft({ ...c }); setError('') }} aria-label={`Edit ${c.subject}`}>
                          <Pencil className="size-3.5" />
                        </button>
                        <button type="button" className="btn btn-ghost p-1! hover:text-rose-600!" onClick={() => setClasses((cs) => cs.filter((x) => x.id !== c.id))} aria-label={`Delete ${c.subject}`}>
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => { setDraft(blank(d)); setError('') }}
                      className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-paper-300 py-2 text-xs font-medium text-paper-500 hover:border-tomato-400 hover:text-tomato-600 dark:border-paper-700"
                    >
                      <Plus className="size-3.5" /> Add
                    </button>
                  </li>
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
