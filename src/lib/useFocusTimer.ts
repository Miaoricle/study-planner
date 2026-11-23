import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../types'

export type TimerMode = 'focus' | 'short' | 'long'
export type TimerStatus = 'idle' | 'running' | 'paused'

export const MODE_LABEL: Record<TimerMode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

function beep() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.25, 0.5].forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.22)
    })
    setTimeout(() => ctx.close(), 1000)
  } catch {
    /* audio unavailable */
  }
}

function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification(title, { body, icon: './favicon.svg' })
    }
  } catch {
    /* notifications unavailable */
  }
}

/**
 * Pomodoro timer. Counts down against an absolute end time, so it stays
 * accurate even when the tab is in the background and intervals are throttled.
 */
export function useFocusTimer(settings: Settings, onFocusComplete: (minutes: number) => void) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remaining, setRemaining] = useState(0)
  const [cycle, setCycle] = useState(0)
  const endAt = useRef(0)
  const plannedMinutes = useRef(settings.focus)
  const onComplete = useRef(onFocusComplete)

  useEffect(() => {
    onComplete.current = onFocusComplete
  })

  const minutesFor = (m: TimerMode) =>
    m === 'focus' ? settings.focus : m === 'short' ? settings.shortBreak : settings.longBreak

  const total = minutesFor(mode) * 60_000
  const left = status === 'idle' ? total : remaining

  useEffect(() => {
    if (status !== 'running') return
    const id = window.setInterval(() => {
      const ms = endAt.current - Date.now()
      if (ms > 0) {
        setRemaining(ms)
        return
      }
      window.clearInterval(id)
      setStatus('idle')
      if (settings.sound) beep()
      if (mode === 'focus') {
        onComplete.current(plannedMinutes.current)
        const done = cycle + 1
        setCycle(done)
        setMode(done % settings.longEvery === 0 ? 'long' : 'short')
        notify('Focus session complete', 'Nice work. Time for a break.')
      } else {
        setMode('focus')
        notify('Break over', 'Ready for another focus session?')
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [status, mode, cycle, settings.sound, settings.longEvery])

  // show the countdown in the tab title while running
  useEffect(() => {
    const base = 'Study Planner'
    if (status === 'idle') {
      document.title = `${base}: Timetable, Deadlines & Focus Timer`
      return
    }
    const s = Math.ceil(left / 1000)
    const mmss = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    document.title = `${status === 'paused' ? '⏸' : '⏱'} ${mmss} · ${MODE_LABEL[mode]}`
  }, [left, status, mode])

  function start() {
    if (status === 'running') return
    const ms = status === 'paused' ? remaining : total
    if (status === 'idle') plannedMinutes.current = minutesFor(mode)
    endAt.current = Date.now() + ms
    setRemaining(ms)
    setStatus('running')
    try {
      if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission()
    } catch {
      /* ignore */
    }
  }

  function pause() {
    if (status !== 'running') return
    setRemaining(Math.max(0, endAt.current - Date.now()))
    setStatus('paused')
  }

  function reset() {
    setStatus('idle')
  }

  function switchMode(m: TimerMode) {
    setMode(m)
    setStatus('idle')
  }

  function skip() {
    if (mode === 'focus') switchMode((cycle + 1) % settings.longEvery === 0 ? 'long' : 'short')
    else switchMode('focus')
  }

  return { mode, status, left, total, cycle, start, pause, reset, skip, switchMode }
}

export type FocusTimer = ReturnType<typeof useFocusTimer>

export const formatClock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
