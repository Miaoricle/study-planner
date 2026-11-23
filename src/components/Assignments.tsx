import { useState, type FormEvent } from 'react'
import { ChevronDown, ClipboardList, Plus, Trash2 } from 'lucide-react'
import type { Assignment, Priority } from '../types'
import { addDays, daysUntil, dueLabel, formatDate, isoDate } from '../lib/date'
import { uid } from '../lib/storage'
import { EmptyState, PageTitle, PriorityBadge } from './ui'

type Props = {
  assignments: Assignment[]
  setAssignments: (fn: (a: Assignment[]) => Assignment[]) => void
  subjects: string[]
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function Assignments({ assignments, setAssignments, subjects }: Props) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [due, setDue] = useState(() => isoDate(addDays(new Date(), 7)))
  const [priority, setPriority] = useState<Priority>('medium')
  const [showDone, setShowDone] = useState(false)

  function add(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAssignments((a) => [
      ...a,
      { id: uid(), title: title.trim(), subject: subject.trim(), due, priority, done: false, createdAt: new Date().toISOString() },
    ])
    setTitle('')
  }

  const toggle = (id: string) => setAssignments((a) => a.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  const remove = (id: string) => setAssignments((a) => a.filter((x) => x.id !== id))

  const pending = assignments
    .filter((a) => !a.done)
    .sort((a, b) => a.due.localeCompare(b.due) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  const done = assignments.filter((a) => a.done).sort((a, b) => b.due.localeCompare(a.due))

  const groups = [
    { title: 'Overdue', items: pending.filter((a) => daysUntil(a.due) < 0), tone: 'text-rose-600 dark:text-rose-400' },
    { title: 'This week', items: pending.filter((a) => daysUntil(a.due) >= 0 && daysUntil(a.due) <= 7), tone: '' },
    { title: 'Later', items: pending.filter((a) => daysUntil(a.due) > 7), tone: '' },
  ].filter((g) => g.items.length > 0)

  const progress = assignments.length ? Math.round((done.length / assignments.length) * 100) : 0

  return (
    <div>
      <PageTitle title="Assignments" subtitle={`${pending.length} to do · ${done.length} done`} />

      <form onSubmit={add} className="card mb-6 grid gap-3 p-4 sm:grid-cols-[2fr_1.3fr_1fr_1fr_auto] sm:items-end" aria-label="Add assignment">
        <label>
          <span className="label">Assignment</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lab report 4" required />
        </label>
        <label>
          <span className="label">Subject</span>
          <input className="input" list="assignment-subjects" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Optional" />
          <datalist id="assignment-subjects">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label>
          <span className="label">Due</span>
          <input type="date" className="input" value={due} onChange={(e) => setDue(e.target.value)} required />
        </label>
        <label>
          <span className="label">Priority</span>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          <Plus className="size-4" /> Add
        </button>
      </form>

      {assignments.length > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="tabular-nums text-slate-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Assignments completed">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <EmptyState icon={<ClipboardList className="size-8" />} title={assignments.length ? 'All caught up 🎉' : 'No assignments yet'}>
          {assignments.length ? 'Every assignment is done.' : 'Add one above and it will show up here, sorted by due date.'}
        </EmptyState>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className={`mb-2 text-sm font-semibold uppercase tracking-wide ${g.tone || 'text-slate-500'}`}>
              {g.title} <span className="font-normal">({g.items.length})</span>
            </h2>
            <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
              {g.items.map((a) => (
                <Row key={a.id} a={a} onToggle={toggle} onRemove={remove} />
              ))}
            </ul>
          </section>
        ))}

        {done.length > 0 && (
          <section>
            <button type="button" className="mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-slate-500" onClick={() => setShowDone((s) => !s)} aria-expanded={showDone}>
              <ChevronDown className={`size-4 transition ${showDone ? '' : '-rotate-90'}`} /> Completed ({done.length})
            </button>
            {showDone && (
              <ul className="card divide-y divide-slate-100 dark:divide-slate-800">
                {done.map((a) => (
                  <Row key={a.id} a={a} onToggle={toggle} onRemove={remove} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function Row({ a, onToggle, onRemove }: { a: Assignment; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
  const n = daysUntil(a.due)
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={a.done}
        onChange={() => onToggle(a.id)}
        className="size-5 shrink-0 cursor-pointer accent-emerald-600"
        aria-label={`Mark "${a.title}" as ${a.done ? 'not done' : 'done'}`}
      />
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${a.done ? 'text-slate-400 line-through' : ''}`}>{a.title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {a.subject && <>{a.subject} · </>}
          {formatDate(a.due)}
        </p>
      </div>
      {!a.done && (
        <>
          <PriorityBadge priority={a.priority} />
          <span
            className={`hidden w-32 text-right text-sm font-semibold sm:block ${n < 0 ? 'text-rose-600 dark:text-rose-400' : n <= 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
          >
            {dueLabel(a.due)}
          </span>
        </>
      )}
      <button type="button" className="btn btn-ghost p-1.5! hover:text-rose-600!" onClick={() => onRemove(a.id)} aria-label={`Delete "${a.title}"`}>
        <Trash2 className="size-4" />
      </button>
    </li>
  )
}
