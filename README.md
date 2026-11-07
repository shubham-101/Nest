# Nest — Designer Habit Tracker

> A calm, beautiful, and quietly powerful life-os for designers & creatives — track habits, focus deeply, study, sleep, save money, and ship work, all in one installable mobile-first web app.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS (local-first, offline-capable PWA) — zero backend required.

---

## ✨ Highlights

- **20+ modules** — habits, study, reading, skills, projects, journal, wellness, gym, finance, nutrition, meditation, planner, challenges, quit-bad-habits, goals, portfolio, inspiration, stats, focus timer, review, palette lab.
- **Local-first, multi-profile** — multiple named profiles per device, each with isolated data. Sync between devices via portable file export.
- **Installable PWA** — works offline; install to home screen on Android & iOS.
- **Gamification** — XP, levels, 13 badges, streaks, streak-freezes, challenges.
- **Smart coach** — built-in insights/w-tips, plus optional OpenAI/Anthropic key for your own AI suggestions (stored locally, never leaves your browser).
- **Designer tools** — color palette lab (harmonies, shades, contrast checker, CSS export), inspiration board with palette extraction, portfolio tracker.
- **Calendar reminders** — one-off & recurring (daily/weekly/monthly), linked to habits/projects, browser notifications + in-app notification center.

## 📸 Features

| Module | What it does |
|---|---|
| **Dashboard** | Greeting, daily progress, streak/level stats, coach insights, mood & energy log |
| **Habits** | 6 types (yes/no, numeric, duration, mood, rating, checklist), categories, reminders, stacking, archive, CSV export, templates |
| **Calendar** | Month view + year heatmap, editable day entries, reminders |
| **Stats** | 30-day trends, per-habit completion bars, category breakdown, streak table |
| **Focus** | Pomodoro presets, linked to habits, session history |
| **Inspiration** | Image capture, URL, tags, auto color-palette extraction |
| **Portfolio** | Shipped work gallery with images & links |
| **Study** | Topics, study sessions, resource library with progress |
| **Reading** | Book list with page progress & ratings |
| **Skills** | Skill levels, practice log, total minutes |
| **Projects** | Milestones, tasks, priorities, deadlines |
| **Wellness** | Water intake, sleep log, gym workout tracker (sets/reps × weight) |
| **Finance** | Income/expense log, category breakdown, balance |
| **Nutrition** | Meals + calories & macros vs targets |
| **Meditation** | Timer + session log |
| **Planner** | Daily time-blocking with a 6am–10pm grid |
| **Journal** | Gratitude entries + second-brain notes |
| **Challenges** | N-day challenges with per-day check-in grid |
| **Quit** | Bad-habit tracker with clean-day counter, urge log, trigger analysis, money saved |
| **Goals** | Progress bars, habit linking, deadlines |
| **Palette Lab** | Harmonies, shades, WCAG contrast checker, CSS export |
| **Review** | Weekly summary, mood/energy averages, reflection journal + AI coach |
| **Settings** | Profile sync, theme, accent color, AI key, JSON import/export, reset |

## 🚀 Quick start

```bash
# install dependencies
npm install

# run locally (http://localhost:5173 — phone accessible via your LAN IP)
npm run dev

# production build
npm run build
```

**Test on your phone:** run `npm run dev`, open `http://<your-PC-LAN-IP>:5173` on your phone (same Wi-Fi), then browser menu → *Install app* / *Add to Home screen*.

## 🛠 Deploy

**Vercel (recommended)**
```bash
npm i -g vercel
vercel login
vercel --prod
```
The included `vercel.json` sets the Vite preset, build/output dirs, and the SPA rewrite so deep links (`/habits`, `/calendar`, …) survive refresh.

**GitHub + Vercel dashboard** — push the repo, import it on vercel.com, framework preset: **Vite**. Every push auto-redeploys.

**Any static host** — serve the `dist/` folder (Netlify, Cloudflare Pages, GitHub Pages with a 404 → index.html fallback).

## 📦 Data & privacy

- All data lives in your browser's `localStorage` — **nothing is sent anywhere**.
- Stored per-profile (`studio-habit-tracker:<profileId>`), so multiple people can share a device.
- **Sync:** export all profiles to a single `.json` (Settings → Export all profiles), then *Import sync file* on another device. Your data moves with the file.
- AI keys (optional, Settings) are stored only locally and used for direct provider calls.

## 🎨 Customization

- **Themes:** light / dark (navy, default) / system; accent color picker in Settings
- **Sidebar:** collapse into an icon rail with hover tooltips; state persists
- **Mood & energy** shown next to the logo

## 🗂 Project structure

```
src/
  types/        data models
  store/        zustand store (persistence)
  lib/          stats, dates, reminders engine, AI coach, export/sync, profiles
  components/   layout (sidebar, topbar), ui primitives, shared widgets
  pages/        one file per module
  App.tsx       router + lazy-loaded routes
public/         PWA manifest, service worker, icons
```

## 🧪 Tech

| Concern | Choice |
|---|---|
| Build | Vite 8 + TypeScript |
| UI | React 18, Tailwind CSS v4, Framer Motion, Radix (Dialog/Select/Tooltip/Slider) |
| State | Zustand + persist (localStorage) |
| Charts | Recharts |
| Dates | date-fns |
| DnD | @dnd-kit |
| Icons | lucide-react |

## 🔮 Roadmap ideas

- Optional cloud sync (Firebase/Supabase) with real accounts
- Voice notes, shareable weekly report cards
- Custom streak-freeze inventory, widgets for home screen
- Desktop app via Electron/Tauri wrapping this codebase

## 📄 License

Private project. All rights reserved.
