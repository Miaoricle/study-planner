# 📚 Study Planner

A free, no-signup study planner for students. Keep your **weekly timetable**, **assignment deadlines** and a **Pomodoro focus timer** in one place.

**Live demo:** https://miaoricle.github.io/study-planner/

Everything is saved in your browser (localStorage). There's no account and no server, and your data never leaves your device.

## Features

- **Today view**: today's classes with *Now* / *Next* badges, deadlines for the next 7 days, and a weekly focus chart.
- **Weekly timetable**: add, edit and colour-code classes. Today's column is highlighted, and weekends appear only if you have weekend classes.
- **Assignments**: grouped into *Overdue*, *This week* and *Later*, with priority badges, "due in 3 days" countdowns and a progress bar.
- **Pomodoro focus timer**:
  - Customisable focus and break lengths, with a long break every *n* sessions.
  - Plays a sound when a session ends, and sends a browser notification if the tab is in the background.
  - Shows the countdown in the tab title.
  - Logs each session by subject.
  - Stays accurate in background tabs, because it counts down to a fixed end time instead of counting ticks.
- **Backup and restore** as JSON to move your planner between devices.
- **Works on phone and desktop**: a responsive layout with a bottom tab bar on mobile. It's installable as an app (PWA): on a phone, choose *Add to Home Screen*; on desktop Chrome or Edge, use the install icon in the address bar. After the first visit it also works offline.
- Light/dark mode, plus keyboard- and screen-reader-friendly controls.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · lucide-react

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## Deploy

Every push to `main` builds and deploys to **GitHub Pages** through `.github/workflows/deploy.yml`.
To turn this on for a new repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.

## Project structure

```
src/
  App.tsx                 tabs, shared state, timer
  components/             Dashboard, Timetable, Assignments, Focus, SettingsPanel, ui
  lib/useFocusTimer.ts    Pomodoro logic
  lib/storage.ts          localStorage-backed state
  lib/date.ts             date helpers (local time, Monday-first weeks)
  lib/sample.ts           sample timetable for first-time visitors
```

## Contributing

Issues and pull requests are welcome. Ideas: clash detection for overlapping classes, exam countdowns, and a GPA calculator tab.

## License

MIT © Amir Nazhan
