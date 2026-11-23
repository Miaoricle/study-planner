import type { Assignment, ClassSlot } from '../types'
import { addDays, isoDate } from './date'
import { uid } from './storage'

export function sampleData(): { classes: ClassSlot[]; assignments: Assignment[] } {
  const c = (subject: string, day: number, start: string, end: string, location: string, color: ClassSlot['color']): ClassSlot => ({
    id: uid(),
    subject,
    day,
    start,
    end,
    location,
    color,
  })
  const today = new Date()
  const a = (title: string, subject: string, inDays: number, priority: Assignment['priority']): Assignment => ({
    id: uid(),
    title,
    subject,
    due: isoDate(addDays(today, inDays)),
    priority,
    done: false,
    createdAt: new Date().toISOString(),
  })

  return {
    classes: [
      c('Data Structures', 0, '09:00', '11:00', 'Lab 2', 'indigo'),
      c('Software Engineering', 0, '14:00', '16:00', 'Room B204', 'emerald'),
      c('Database Systems', 1, '10:00', '12:00', 'Lab 4', 'amber'),
      c('Mobile App Dev', 2, '08:30', '10:30', 'Lab 1', 'sky'),
      c('Data Structures', 2, '14:00', '15:00', 'Tutorial Room 3', 'indigo'),
      c('Statistics', 3, '11:00', '13:00', 'Hall A', 'rose'),
      c('Software Engineering', 4, '09:00', '11:00', 'Room B204', 'emerald'),
      c('Study group', 4, '15:00', '17:00', 'Library', 'violet'),
    ],
    assignments: [
      a('Lab report 3: Linked lists', 'Data Structures', 1, 'high'),
      a('ER diagram for group project', 'Database Systems', 3, 'medium'),
      a('Requirements spec draft', 'Software Engineering', 6, 'high'),
      a('Quiz revision: chapters 4–5', 'Statistics', 9, 'low'),
      a('Flutter UI prototype', 'Mobile App Dev', 13, 'medium'),
    ],
  }
}
