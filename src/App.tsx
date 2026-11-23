import { useState } from 'react'
import { BookOpen, CalendarDays, LayoutDashboard, ListChecks, Settings as SettingsIcon, Timer } from 'lucide-react'
import { DEFAULT_SETTINGS, type Assignment, type ClassSlot, type FocusSession, type Settings } from './types'
import { useStoredState, uid } from './lib/storage'
import { formatClock, MODE_LABEL, useFocusTimer } from './lib/useFocusTimer'
import { Dashboard } from './components/Dashboard'
import { Timetable } from './components/Timetable'
import { Assignments } from './components/Assignments'
import { Focus } from './components/Focus'
import { SettingsPanel } from './components/SettingsPanel'

const TABS = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'assignments', label: 'Assignments', icon: ListChecks },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
] as const

export type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [tab, setTab] = useStoredState<TabId>('tab', 'today')
  const [classes, setClasses] = useStoredState<ClassSlot[]>('classes', [])
  const [assignments, setAssignments] = useStoredState<Assignment[]>('assignments', [])
  const [sessions, setSessions] = useStoredState<FocusSession[]>('sessions', [])
  const [settings, setSettings] = useStoredState<Settings>('settings', DEFAULT_SETTINGS)
  const [focusSubject, setFocusSubject] = useState('')

  const timer = useFocusTimer(settings, (minutes) =>
    setSessions((s) => [...s, { id: uid(), subject: focusSubject, minutes, endedAt: new Date().toISOString() }]),
  )

  const subjects = [...new Set([...classes.map((c) => c.subject), ...assignments.map((a) => a.subject)].filter(Boolean))].sort()

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-paper-200 bg-paper-50/85 backdrop-blur dark:border-paper-800 dark:bg-paper-950/85">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <button type="button" onClick={() => setTab('today')} className="flex items-center gap-2 font-bold">
            <span className="grid size-8 place-items-center rounded-md bg-tomato-500 text-paper-50">
              <BookOpen className="size-4.5" />
            </span>
            <span className="font-serif text-lg font-semibold">Study Planner</span>
          </button>

          {timer.status !== 'idle' && tab !== 'focus' && (
            <button
              type="button"
              onClick={() => setTab('focus')}
              className="ml-auto rounded-full bg-tomato-50 px-3 py-1 text-sm font-semibold tabular-nums text-tomato-700 dark:bg-tomato-500/15 dark:text-tomato-300 md:order-last md:ml-0"
            >
              {timer.status === 'paused' ? '⏸' : '⏱'} {MODE_LABEL[timer.mode]} · {formatClock(timer.left)}
            </button>
          )}

          <nav className="hidden flex-1 justify-center md:flex" aria-label="Sections">
            <TabList tab={tab} setTab={setTab} />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12">
        {tab === 'today' && (
          <Dashboard classes={classes} assignments={assignments} sessions={sessions} timer={timer} setTab={setTab} onLoadSample={(d) => { setClasses(d.classes); setAssignments(d.assignments) }} />
        )}
        {tab === 'timetable' && <Timetable classes={classes} setClasses={setClasses} />}
        {tab === 'assignments' && <Assignments assignments={assignments} setAssignments={setAssignments} subjects={subjects} />}
        {tab === 'focus' && (
          <Focus timer={timer} sessions={sessions} settings={settings} setSettings={setSettings} subjects={subjects} subject={focusSubject} setSubject={setFocusSubject} />
        )}
        {tab === 'settings' && (
          <SettingsPanel
            data={{ classes, assignments, sessions, settings }}
            onImport={(d) => {
              setClasses(d.classes)
              setAssignments(d.assignments)
              setSessions(d.sessions)
              setSettings({ ...DEFAULT_SETTINGS, ...d.settings })
            }}
          />
        )}
      </main>

      {/* mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-200 bg-paper-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-paper-800 dark:bg-paper-950/95"
        aria-label="Sections"
      >
        <TabList tab={tab} setTab={setTab} mobile />
      </nav>
    </div>
  )
}

function TabList({ tab, setTab, mobile = false }: { tab: TabId; setTab: (t: TabId) => void; mobile?: boolean }) {
  return (
    <ul className={mobile ? 'grid grid-cols-5' : 'flex gap-1 rounded-md bg-paper-200/70 p-1 dark:bg-paper-900'}>
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={
                mobile
                  ? `flex w-full flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium ${active ? 'text-tomato-600 dark:text-tomato-400' : 'text-paper-500'}`
                  : `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? 'bg-paper-50 text-paper-900 dark:bg-paper-800 dark:text-paper-50'
                        : 'text-paper-500 hover:text-paper-900 dark:hover:text-paper-50'
                    }`
              }
            >
              <Icon className={mobile ? 'size-5' : 'size-4'} />
              {label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
