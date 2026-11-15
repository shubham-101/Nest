import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Check, Sparkles } from 'lucide-react';
import { HelpButton } from '../components/HelpButton';

// ---- sample library (10 each) ----
const GOALS = [
  'Read 12 books this year', 'Sleep 7h+ nightly', 'Exercise 3x per week', 'Ship portfolio redesign',
  'Save ₹50,000 emergency fund', 'Learn Japanese N4 grammar', 'Meditate 10 minutes daily', 'Write 500 words daily',
  'Gain 5kg muscle', 'Run a 5K under 30:00',
];
const CHALLENGES = [
  { name: 'No sugar', duration: 30 }, { name: 'Morning pages', duration: 21 }, { name: 'Digital sunset (no screens after 10pm)', duration: 14 },
  { name: 'Daily sketch', duration: 30 }, { name: 'Cold showers', duration: 21 }, { name: '1 hour reading', duration: 30 },
  { name: 'No caffeine after 2pm', duration: 14 }, { name: 'Walk 8k steps', duration: 30 }, { name: 'Gratitude journal', duration: 21 }, { name: 'No doomscrolling', duration: 30 },
];
const QUIT = [
  { name: 'Smoking', icon: '🚭', reason: 'Health + money', costPerOccurrence: 200 },
  { name: 'Doomscrolling', icon: '📱', reason: 'Reclaim focus', costPerOccurrence: 0 },
  { name: 'Sugar / sweets', icon: '🍩', reason: 'Energy & mood', costPerOccurrence: 50 },
  { name: 'Junk food', icon: '🍔', reason: 'Body composition', costPerOccurrence: 150 },
  { name: 'Caffeine late in day', icon: '☕', reason: 'Sleep quality', costPerOccurrence: 30 },
  { name: 'Alcohol', icon: '🍺', reason: 'Clarity & health', costPerOccurrence: 300 },
  { name: 'Nail biting', icon: '💅', reason: 'Self-control', costPerOccurrence: 0 },
  { name: 'Procrastination', icon: '⏳', reason: 'Ship more', costPerOccurrence: 0 },
  { name: 'Online shopping', icon: '🛍️', reason: 'Save money', costPerOccurrence: 500 },
  { name: 'Staying up late', icon: '🌙', reason: 'Morning energy', costPerOccurrence: 0 },
];
const PROJECTS = [
  { name: 'Portfolio revamp', description: 'New case studies + about', tags: ['design', 'career'] },
  { name: 'Personal brand site', description: 'Next.js + CMS', tags: ['dev', 'web'] },
  { name: 'Design system', description: 'Colors, type, components', tags: ['design-system'] },
  { name: 'YouTube channel', description: 'Weekly videos on design', tags: ['content'] },
  { name: 'Newsletter', description: 'Bi-weekly design newsletter', tags: ['content'] },
  { name: 'Side project: Habit app', description: 'This app, shipped', tags: ['product', 'dev'] },
  { name: 'Photography series', description: 'Documentary street series', tags: ['photo'] },
  { name: 'Open source plugin', description: 'Figma plugin or tool', tags: ['tool'] },
  { name: 'Course: Typography', description: 'Deep dive on type basics', tags: ['education'] },
  { name: 'Resume + LinkedIn overhaul', description: 'Update all job materials', tags: ['career'] },
];
const INSPIRATION = [
  { title: 'Duotone hero section', tags: ['hero', 'duotone', 'web'], note: 'Oversized type + gradient image', url: '' },
  { title: 'Grain texture background', tags: ['texture', 'grain', 'poster'], note: 'Adds warmth to flat layouts' },
  { title: 'Serif display + sans body', tags: ['typography', 'pairing'], note: 'Editorial pair that always works' },
  { title: 'Asymmetric grid + overlap', tags: ['grid', 'layout'], note: 'Breaks the box, feels intentional' },
  { title: 'Muted pastel + one loud CTA', tags: ['color', 'pastel'], note: 'Calm with a single punch' },
  { title: 'Monochrome photography', tags: ['photo', 'monochrome'], note: 'Focus on light and form' },
  { title: 'Micro-interactions on hover', tags: ['motion', 'interaction'], note: 'Subtle delight > flashy' },
  { title: 'Hand-drawn illustration style', tags: ['illustration', 'style'], note: 'Human touch for sterile brands' },
  { title: 'Japanese / wabi-sabi palette', tags: ['wabi-sabi', 'palette'], note: 'Beige, sand, ink' },
  { title: 'Generous whitespace', tags: ['layout', 'whitespace'], note: 'Luxury is what you remove' },
];
const WELLNESS = [
  { key: 'water', label: 'Drink 8 glasses of water', color: '#2563eb' },
  { key: 'sleep', label: 'Sleep 7–9 hours', color: '#6366f1' },
  { key: 'walk', label: 'Walk 30 minutes', color: '#16a34a' },
  { key: 'stretch', label: 'Stretch 5 minutes', color: '#d97706' },
  { key: 'posture', label: 'Check posture hourly', color: '#7c3aed' },
  { key: 'screen-off', label: 'Screens off 30 min before bed', color: '#0f766e' },
  { key: 'sun', label: 'Get sunlight in morning', color: '#f59e0b' },
  { key: 'meal', label: 'Eat real food, 3 meals', color: '#16a34a' },
  { key: 'weight', label: 'Log weight weekly', color: '#dc2626' },
  { key: 'gym', label: 'Work out 3x / week', color: '#db2777' },
];
const SKILLS = [
  { name: 'Typography', category: 'Design', notes: 'Hierarchy, pairing, scale' },
  { name: 'Figma', category: 'Tools', notes: 'Auto-layout, variables, prototyping' },
  { name: 'React', category: 'Code', notes: 'Components, hooks, state' },
  { name: 'HTML & CSS', category: 'Code', notes: 'Fundamentals first' },
  { name: 'UI/UX patterns', category: 'Design', notes: 'Flows, IA, patterns' },
  { name: 'Color theory', category: 'Design', notes: 'Harmony, contrast, accessibility' },
  { name: 'Motion', category: 'Design', notes: 'Micro-interactions, easing' },
  { name: 'Photography', category: 'Visuals', notes: 'Composition, light' },
  { name: 'Copywriting', category: 'Writing', notes: 'Clear, concise copy' },
  { name: 'Product thinking', category: 'Strategy', notes: 'Problem → outcome' },
];
const READING = [
  { title: 'The Design of Everyday Things', author: 'Don Norman', tags: ['design', 'classic'] },
  { title: 'Thinking with Type', author: 'Ellen Lupton', tags: ['typography'] },
  { title: 'Atomic Habits', author: 'James Clear', tags: ['habits'] },
  { title: 'Four Thousand Weeks', author: 'Oliver Burkeman', tags: ['time', 'life'] },
  { title: 'Steal Like an Artist', author: 'Austin Kleon', tags: ['creativity'] },
  { title: 'Shape Up', author: 'Ryan Singer', tags: ['product'] },
  { title: 'Don\'t Make Me Think', author: 'Steve Krug', tags: ['usability'] },
  { title: 'The Elements of User Experience', author: 'Jesse Garrett', tags: ['ux'] },
  { title: 'Refactoring UI', author: 'Wathan & Schutmann', tags: ['ui', 'visual'] },
  { title: 'The Creative Act', author: 'Rick Rubin', tags: ['creativity'] },
];
const STUDY = [
  { name: 'Japanese (Kanji)', subject: 'Languages' },
  { name: 'HCI papers', subject: 'Research' },
  { name: 'Typography', subject: 'Design' },
  { name: 'React internals', subject: 'Engineering' },
  { name: 'Motion design', subject: 'Animation' },
  { name: 'History of graphic design', subject: 'Design' },
  { name: 'Color theory', subject: 'Design' },
  { name: 'Data structures', subject: 'CS' },
  { name: 'Product strategy', subject: 'Business' },
  { name: 'Copywriting', subject: 'Writing' },
];

const TABS = ['Goals', 'Challenges', 'Quit', 'Projects', 'Inspiration', 'Wellness', 'Skills', 'Reading', 'Study'] as const;

export default function Starters() {
  const addGoal = useStore(s => s.addGoal);
  const addChallenge = useStore(s => s.addChallenge);
  const addBadHabit = useStore(s => s.addBadHabit);
  const addProject = useStore(s => s.addProject);
  const addInspiration = useStore(s => s.addInspiration);
  const addSkill = useStore(s => s.addSkill);
  const addBook = useStore(s => s.addBook);
  const addStudyTopic = useStore(s => s.addStudyTopic);
  const addHabit = useStore(s => s.addHabit);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<(typeof TABS)[number]>('Goals');

  const mark = (id: string) => setAdded(prev => { const n = new Set(prev); n.add(id); return n; });

  const addGoalFn = (g: string) => { addGoal({ id: uid(), title: g, target: 1, current: 0, unit: 'x', createdAt: new Date().toISOString(), completed: false } as any); mark(g); };
  const addChallengeFn = (c: { name: string; duration: number }) => { addChallenge({ id: uid(), name: c.name, description: '', duration: c.duration, startDate: todayStr(), completedDays: [], createdAt: new Date().toISOString() } as any); mark(c.name); };
  const addQuitFn = (q: any) => { addBadHabit({ id: uid(), name: q.name, icon: q.icon, color: '#dc2626', reason: q.reason, triggers: [], replacementHabitId: '', costPerOccurrence: q.costPerOccurrence, currency: '₹', targetDays: 30, startDate: todayStr(), archived: false, createdAt: new Date().toISOString() } as any); mark(q.name); };
  const addProjectFn = (p: any) => { addProject({ id: uid(), name: p.name, description: p.description, status: 'idea', progress: 0, color: '#0f766e', tags: p.tags || [], createdAt: new Date().toISOString() } as any); mark(p.name); };
  const addInspirationFn = (i: any) => { addInspiration({ id: uid(), title: i.title, tags: i.tags || [], note: i.note, url: i.url || '', colorPalette: [], createdAt: new Date().toISOString() } as any); mark(i.title); };
  const addWellnessFn = (w: any) => { addHabit({ id: uid(), name: w.label, icon: '💪', color: w.color, type: 'boolean', category: 'health', frequency: 'daily', daysOfWeek: [0, 1, 2, 3, 4, 5, 6], archived: false, createdAt: new Date().toISOString(), order: 999, checklistItems: [] } as any); mark(w.label); };
  const addSkillFn = (s: any) => { addSkill({ id: uid(), name: s.name, category: s.category, level: 0, target: 100, notes: s.notes, createdAt: new Date().toISOString() } as any); mark(s.name); };
  const addReadingFn = (b: any) => { addBook({ id: uid(), title: b.title, author: b.author, cover: '', status: 'want', currentPage: 0, totalPages: 0, rating: 0, notes: '', tags: b.tags || [], createdAt: new Date().toISOString() } as any); mark(b.title); };
  const addStudyFn = (t: any) => { addStudyTopic({ id: uid(), name: t.name, subject: t.subject, color: '#2563eb', icon: '📘', createdAt: new Date().toISOString() } as any); mark(t.name); };

  const renderList = () => {
    const item = (id: string, label: string, onAdd: () => void, sub?: string) => (
      <div key={id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface hover:bg-surface-2 transition">
        <div className="flex-1"><div className="text-sm font-medium">{label}</div>{sub && <div className="text-xs text-text-muted">{sub}</div>}</div>
        {added.has(id)
          ? <span className="flex items-center gap-1 text-xs text-accent"><Check size={14} /> Added</span>
          : <Button size="sm" variant="ghost" onClick={onAdd}><Plus size={14} /> Add</Button>}
      </div>
    );
    switch (tab) {
      case 'Goals': return GOALS.map(g => item(g, g, () => addGoalFn(g)));
      case 'Challenges': return CHALLENGES.map(c => item(c.name, c.name, () => addChallengeFn(c), `${c.duration} days`));
      case 'Quit': return QUIT.map(q => item(q.name, q.name, () => addQuitFn(q), `${q.reason}${q.costPerOccurrence ? ` · ₹${q.costPerOccurrence}/` : ''}`));
      case 'Projects': return PROJECTS.map(p => item(p.name, p.name, () => addProjectFn(p), p.description));
      case 'Inspiration': return INSPIRATION.map(i => item(i.title, i.title, () => addInspirationFn(i), i.note));
      case 'Wellness': return WELLNESS.map(w => item(w.label, w.label, () => addWellnessFn(w)));
      case 'Skills': return SKILLS.map(s => item(s.name, s.name, () => addSkillFn(s), `${s.category} · ${s.notes}`));
      case 'Reading': return READING.map(b => item(b.title, b.title, () => addReadingFn(b), `${b.author}${b.tags?.length ? ' · ' + b.tags.join(', ') : ''}`));
      case 'Study': return STUDY.map(s => item(s.name, s.name, () => addStudyFn(s), s.subject));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl">Sample starter packs</h1>
        <Sparkles className="text-amber-500" size={26} />
        <HelpButton pageKey="starters" />
      </div>
      <p className="text-text-muted text-sm max-w-2xl">Curated starter items across every module. Tap any card to add it to your list — you can delete or edit it afterwards.</p>
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>{t}</button>
        ))}
      </div>
      <Card>
        <CardContent className="grid sm:grid-cols-2 gap-3 py-5">{renderList()}</CardContent>
      </Card>
    </div>
  );
}