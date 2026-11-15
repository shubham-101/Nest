import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '../lib/cn';

const PAGE_INFO: Record<string, { title: string; blurb: string; tips: string[] }> = {
  dashboard: {
    title: 'Dashboard',
    blurb: 'Your daily command center at a glance.',
    tips: ['See today\'s progress, current streak, and level', 'One-tap check off habits from the list', 'Mood & energy log updates Coach insights', 'Coach insights tailor to your real data'],
  },
  habits: {
    title: 'Habits',
    blurb: 'Build repeatable daily routines with tracking.',
    tips: ['Create typed habits: yes/no, numeric, duration, mood, rating, checklist', 'Drag the grip handle to reorder (top = most important)', 'Long-press dots on the Habit row for menu → freeze streak', 'Filter by category and archive when done'],
  },
  study: {
    title: 'Study tracker',
    blurb: 'Structured learning beyond raw hours.',
    tips: ['Topics act as subjects — icons, colors, totals', 'Log study sessions with notes per date', 'Track books/articles/videos/courses with progress %', 'Use it with the Focus timer to time-box study'],
  },
  reading: {
    title: 'Reading list',
    blurb: 'From "want to read" to "done" with frictionless capture.',
    tips: ['Add the book once — progress is a click away', 'Type your current page to update the bar', 'Finish sets a timestamp & unlocks star rating'],
  },
  skills: {
    title: 'Skills',
    blurb: 'Grow measurable capabilities over time.',
    tips: ['Slide level or add practice sessions to earn XP', 'Practice minutes add up — great before reviews', 'Target is your 100%, current level in between'],
  },
  projects: {
    title: 'Projects',
    blurb: 'Small portfolio of ships, not to-do chaos.',
    tips: ['Each project has tasks, milestones, progress bar', 'Click a card to expand its tasks', 'Priority chips help you triage'],
  },
  calendar: {
    title: 'Calendar',
    blurb: 'See your consistency patterns across months.',
    tips: ['Tap any day to review and edit that day\'s entries', 'Amber dots = reminders that day; bell up top lists them', 'Heatmap = last year of completions'],
  },
  stats: {
    title: 'Stats & analytics',
    blurb: 'Quantified self with habit science.',
    tips: ['Line chart = last 30 days completions', 'Bars show per-habit consistency', 'Pie shows category weight; streaks table ranks current/best'],
  },
  focus: {
    title: 'Focus timer',
    blurb: 'Deep work in measured sprints.',
    tips: ['Focus minutes ÷ 10 (min 4) drives the 3rd "Soft" clock — hits a quick breather', 'Ring plays on completion; Stop ring to silence', 'Cycles: repeat focus → break as many times as you want; 4 default', '+1 / +5 / +10 adjusts break minutes on the fly', 'Pick an activity beforehand — after completion it auto-logs to Reading/Study/Skills/Meditation/Gym'],
  },
  inspiration: {
    title: 'Inspiration',
    blurb: 'Designer\'s swipe file — capture now, mine later.',
    tips: ['Save image + tags + palette + link in one place', 'Color extraction pulls 5 hex tags from the image', 'Tag nerds: keep tags consistent to find later'],
  },
  portfolio: {
    title: 'Portfolio',
    blurb: 'Your ships, collected.',
    tips: ['Drop image + link + tags for each project', 'Shipped toggle moves it to shipped; XP/badges react', 'Keep it up to date — great for interviews'],
  },
  journal: {
    title: 'Journal',
    blurb: 'Think out loud — then let Coach read it.',
    tips: ['Gratitude tab = 3 things per day; compounds mood', 'Notes tab is a free-form second brain (pin important ones)', 'Write then ask Coach what it sees'],
  },
  wellness: {
    title: 'Wellness',
    blurb: 'The physical floor your output walks on.',
    tips: ['Water: +/- glass buttons, target 8/day', 'Sleep logs compute duration + star quality', 'Gym: log workouts, sets/reps/weight per exercise'],
  },
  challenges: {
    title: 'Challenges',
    blurb: 'Structured streak experiments.',
    tips: ['Pick 7/30/60/90-day challenges', 'Check off days you held', 'Link to a habit to count it automatically'],
  },
  quit: {
    title: 'Quit bad habits',
    blurb: 'The flip side of tracking good ones.',
    tips: ['Days clean resets after a relapse', 'Log urges with intensity/trigger to find patterns', 'Cravings logged = better shakes; money saved counts up'],
  },
  goals: {
    title: 'Goals',
    blurb: 'Measurable targets behind the habits.',
    tips: ['Current/target units; linked to a habit if useful', 'Each +1 tap increments; done when you mark complete', 'Deadline drives urgency (you have to be honest here)'],
  },
  finance: {
    title: 'Finance',
    blurb: 'Rough money awareness, zero budgeting pain.',
    tips: ['Quick log income/expense; balance updates live', 'Category bars show leaks', 'It\'s awareness, not accounting — keep it simple'],
  },
  nutrition: {
    title: 'Nutrition',
    blurb: 'What you fuel with — enough, not perfect.',
    tips: ['Log meals + calories + macros', 'Set daily targets in the Targets button', 'Bars fill as you hit each target'],
  },
  meditation: {
    title: 'Meditation',
    blurb: 'Gentle, automatic off-switch for the mind.',
    tips: ['Pick a style, tap Start, stop when done', 'Timer counts up; saves at 30s+', 'Each session adds to your minutes total'],
  },
  planner: {
    title: 'Planner',
    blurb: 'Time-block the day so it makes itself.',
    tips: ['Blocks render on a day grid; add across hours', 'Colors help chunk types of work', 'Use with Focus timer: block "Design 9–10:30"'],
  },
  palette: {
    title: 'Palette lab',
    blurb: 'Factory: harmonies → shades → WCAG contrast → CSS.',
    tips: ['Pick base color; harmonies generate live', 'Shades scale from one hue for consistency', 'Contrast check grades AA/AAA; copy hexes to clipboard'],
  },
  review: {
    title: 'Nest Coach',
    blurb: 'Reads your real data; talks back.',
    tips: ['Ask free-form: "why do I slip?" or "my plan tomorrow"', 'Uses habits, mood, sleep, streaks, goals — no cloud', 'Journal reflection: write a thought, get it read'],
  },
  settings: {
    title: 'Settings',
    blurb: 'Personalization and data export.',
    tips: ['Profile & sync: export/import .json between devices', 'Accent color & theme, notification toggle', 'Export .json as backup; reset all if you want a clean slate'],
  },
  starters: {
    title: 'Starter packs',
    blurb: 'Pre-built samples to bootstrap any module.',
    tips: ['Pick a category tab (Goals, Challenges, Quit, Projects, Inspiration, Wellness, Skills, Reading, Study)', 'Tap “Add” on any item — it lands in your list', 'Delete/edit added items the same way as your own'],
  },
  profileswitch: {
    title: 'Choose a profile',
    blurb: 'Everyone gets their own private Nest on this device.',
    tips: ['Pick an existing profile to load its data', 'Create new profiles for family/roommates', 'Sync file moves profiles between devices'],
  },
};

export function HelpButton({ pageKey, className }: { pageKey: keyof typeof PAGE_INFO | string; className?: string }) {
  const [open, setOpen] = useState(false);
  const info = PAGE_INFO[pageKey as string];
  if (!info) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`About ${info.title}`}
        title="What is this?"
        className={cn('h-8 w-8 rounded-full border border-border text-text-muted hover:text-accent hover:border-accent transition flex items-center justify-center', className)}
      >
        <Info size={16} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={`${info.title} guide`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-[92vw] max-h-[70vh] overflow-auto p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl leading-tight">{info.title}</h3>
                <p className="text-sm text-text-muted mt-1">{info.blurb}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text" aria-label="Close"><X size={18} /></button>
            </div>
            <ul className="space-y-2">
              {info.tips.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-muted leading-snug">
                  <span className="text-accent font-bold">•</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
