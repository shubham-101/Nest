import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useStore } from './store/useStore';
import { evaluateBadges } from './lib/badges';
import { isCompleted, streakForHabit } from './lib/stats';
import { todayStr } from './lib/dates';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/CommandPalette';
import { lazy, Suspense } from 'react';
import Onboarding from './pages/Onboarding';
import ProfileSwitch from './pages/ProfileSwitch';
import { ACTIVE_PROFILE_KEY } from './lib/profiles';
import { nextOccurrence } from './lib/reminders';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Habits = lazy(() => import('./pages/Habits'));
const Study = lazy(() => import('./pages/Study'));
const Reading = lazy(() => import('./pages/Reading'));
const Skills = lazy(() => import('./pages/Skills'));
const Projects = lazy(() => import('./pages/Projects'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const Stats = lazy(() => import('./pages/Stats'));
const Focus = lazy(() => import('./pages/Focus'));
const Inspiration = lazy(() => import('./pages/Inspiration'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Journal = lazy(() => import('./pages/Journal'));
const Wellness = lazy(() => import('./pages/Wellness'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Goals = lazy(() => import('./pages/Goals'));
const Finance = lazy(() => import('./pages/Finance'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Meditation = lazy(() => import('./pages/Meditation'));
const Planner = lazy(() => import('./pages/Planner'));
const PaletteLab = lazy(() => import('./pages/PaletteLab'));
const Quit = lazy(() => import('./pages/Quit'));
const Review = lazy(() => import('./pages/Review'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  const settings = useStore(s => s.settings);
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const portfolio = useStore(s => s.portfolio);
  const focusSessions = useStore(s => s.focusSessions);
  const stats = useStore(s => s.stats);
  const updateStats = useStore(s => s.updateStats);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const active = habits.filter(h => !h.archived);
    const designCompletions = entries.filter(e => {
      const h = habits.find(x => x.id === e.habitId);
      return h && h.category === 'design' && isCompleted(h, e);
    }).length;
    const focusCount = focusSessions.filter(f => f.completedAt).length;
    const shippedCount = portfolio.filter(p => p.shipped).length;
    const longestStreak = active.reduce((m, h) => Math.max(m, streakForHabit(h, entries)), 0);
    const evalStats = { ...stats, designCompletions, focusCount, shippedCount, longestStreak };
    const badges = evaluateBadges(evalStats);
    if (JSON.stringify(badges) !== JSON.stringify(stats.badges) || longestStreak !== stats.longestStreak) {
      updateStats({ badges, longestStreak });
    }
  }, [habits, entries, portfolio, focusSessions]);

  useEffect(() => {
    const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.setProperty('--color-accent', settings.accentColor);
  }, [settings.theme, settings.accentColor]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // reminders
  useEffect(() => {
    if (!settings.notifications) return;
    const check = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const cur = `${hh}:${mm}`;
      const today = todayStr();
      for (const h of habits) {
        if (h.archived || !h.reminderTime || h.reminderTime !== cur) continue;
        const e = entries.find(x => x.habitId === h.id && x.date === today);
        if (isCompleted(h, e)) continue;
        new Notification('Nest reminder', { body: `Time for: ${h.name}`, icon: '/icon-192.png' });
      }
    };
    const id = setInterval(check, 60000);
    check();
    return () => clearInterval(id);
  }, [settings.notifications, habits, entries]);

  // calendar reminders — browser notifications when due
  const reminders = useStore(s => s.reminders);
  useEffect(() => {
    if (!settings.notifications) return;
    const fired = new Set<string>();
    const check = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date();
      for (const r of reminders) {
        if (r.done) continue;
        const next = nextOccurrence(r, now);
        if (!next) continue;
        const diffMs = next.getTime() - now.getTime();
        // fire if within 60s and not already fired this occurrence
        const key = `${r.id}-${next.toISOString()}`;
        if (diffMs >= 0 && diffMs < 60_000 && !fired.has(key)) {
          fired.add(key);
          const habitName = r.linkedHabitId ? habits.find(h => h.id === r.linkedHabitId)?.name : null;
          new Notification('Nest reminder', {
            body: `🔔 ${r.title}${habitName ? ` · ${habitName}` : ''}${r.note ? ` — ${r.note}` : ''}`,
            icon: '/icon-192.png',
          });
        }
      }
    };
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [settings.notifications, reminders, habits]);

  const [profileSelected] = useState(() => !!localStorage.getItem(ACTIVE_PROFILE_KEY));

  if (!profileSelected) {
    return <ProfileSwitch onEnter={() => window.location.reload()} />;
  }

  if (!settings.onboardingDone) {
    return <Onboarding />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onCommand={() => setCmdOpen(true)} />
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border">
            <Sidebar onCommand={() => { setCmdOpen(true); setMenuOpen(false); }} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-20 md:pb-6">
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>}>
          <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/study" element={<Study />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/meditation" element={<Meditation />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/palette" element={<PaletteLab />} />
            <Route path="/quit" element={<Quit />} />
            <Route path="/review" element={<Review />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </motion.div>
          </AnimatePresence>
          </Suspense>
        </main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <MobileNav />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}