import { useRef, useState, useSyncExternalStore } from 'react'
import { Download, Moon, Sun, Trash2, Upload } from 'lucide-react'
import { DEFAULT_SETTINGS, type PlannerData } from '../types'
import { isoDate } from '../lib/date'
import { PageTitle } from './ui'

type Props = { data: PlannerData; onImport: (d: PlannerData) => void }

function subscribe(cb: () => void) {
  const o = new MutationObserver(cb)
  o.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => o.disconnect()
}
const isDark = () => document.documentElement.classList.contains('dark')

function isPlannerData(v: unknown): v is PlannerData {
  if (!v || typeof v !== 'object') return false
  const d = v as Record<string, unknown>
  return Array.isArray(d.classes) && Array.isArray(d.assignments) && Array.isArray(d.sessions)
}

export function SettingsPanel({ data, onImport }: Props) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  function setTheme(next: boolean) {
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('sp:theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'study-planner', version: 1, ...data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-planner-backup-${isoDate()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Backup downloaded.')
  }

  async function importData(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isPlannerData(parsed)) throw new Error('bad file')
      if (!confirm('Replace your current timetable, assignments and focus history with this backup?')) return
      onImport({ ...parsed, settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) } })
      setMessage('Backup restored.')
    } catch {
      setMessage("That file doesn't look like a Study Planner backup.")
    }
  }

  function clearAll() {
    if (!confirm('Delete all classes, assignments and focus history from this browser? This cannot be undone.')) return
    onImport({ classes: [], assignments: [], sessions: [], settings: DEFAULT_SETTINGS })
    setMessage('All data cleared.')
  }

  return (
    <div className="max-w-2xl">
      <PageTitle title="Settings" />

      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-semibold">Appearance</h2>
          <div className="mt-3 inline-flex gap-1 rounded-md bg-paper-200/70 p-1 dark:bg-paper-800">
            {[
              { v: false, label: 'Light', icon: Sun },
              { v: true, label: 'Dark', icon: Moon },
            ].map(({ v, label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={dark === v}
                onClick={() => setTheme(v)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium ${dark === v ? 'bg-paper-50 dark:bg-paper-950' : 'text-paper-500'}`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Your data</h2>
          <p className="mt-1 text-sm text-paper-500 dark:text-paper-400">
            Everything is saved in this browser only. Nothing is sent to a server. Download a backup to move your planner to another device.
          </p>
          <p className="mt-3 text-sm">
            {data.classes.length} classes · {data.assignments.length} assignments · {data.sessions.length} focus sessions
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={exportData}>
              <Download className="size-4" /> Download backup
            </button>
            <button type="button" className="btn border border-paper-300 dark:border-paper-700" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Restore backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void importData(f)
                e.target.value = ''
              }}
            />
            <button type="button" className="btn text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={clearAll}>
              <Trash2 className="size-4" /> Clear everything
            </button>
          </div>
          {message && (
            <p className="mt-3 text-sm font-medium" role="status">
              {message}
            </p>
          )}
        </section>

        <p className="text-center text-xs text-paper-500">
          Study Planner is free and open source.{' '}
          <a className="font-medium text-tomato-600 hover:underline dark:text-tomato-400" href="https://github.com/Miaoricle/study-planner" target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
