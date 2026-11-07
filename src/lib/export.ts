import type { Habit, HabitEntry, MoodLog, Inspiration, PortfolioItem, FocusSession, Goal, AppSettings, UserStats, StudyTopic, StudySession, StudyResource, Book, Skill, SkillPractice, Project, Milestone, ProjectTask, GratitudeEntry, Note, SleepLog, WaterLog, Challenge, GymWorkout, FinanceEntry, Budget, Meal, NutritionTarget, MeditationSession, TimeBlock, BadHabit, UrgeLog, Reminder } from '../types';

export interface ExportData {
  version: number;
  exportedAt: string;
  habits: Habit[];
  entries: HabitEntry[];
  moods: MoodLog[];
  inspirations: Inspiration[];
  portfolio: PortfolioItem[];
  focusSessions: FocusSession[];
  goals: Goal[];
  settings: AppSettings;
  stats: UserStats;
  studyTopics: StudyTopic[];
  studySessions: StudySession[];
  studyResources: StudyResource[];
  books: Book[];
  skills: Skill[];
  skillPractices: SkillPractice[];
  projects: Project[];
  milestones: Milestone[];
  projectTasks: ProjectTask[];
  gratitudes: GratitudeEntry[];
  notes: Note[];
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  gymWorkouts: GymWorkout[];
  financeEntries: FinanceEntry[];
  budgets: Budget[];
  meals: Meal[];
  nutritionTarget: NutritionTarget;
  meditationSessions: MeditationSession[];
  timeBlocks: TimeBlock[];
  badHabits: BadHabit[];
  urgeLogs: UrgeLog[];
  reminders: Reminder[];
  challenges: Challenge[];
}

export function buildExport(state: any): ExportData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits: state.habits,
    entries: state.entries,
    moods: state.moods,
    inspirations: state.inspirations,
    portfolio: state.portfolio,
    focusSessions: state.focusSessions,
    goals: state.goals,
    settings: state.settings,
    stats: state.stats,
    studyTopics: state.studyTopics,
    studySessions: state.studySessions,
    studyResources: state.studyResources,
    books: state.books,
    skills: state.skills,
    skillPractices: state.skillPractices,
    projects: state.projects,
    milestones: state.milestones,
    projectTasks: state.projectTasks,
    gratitudes: state.gratitudes,
    notes: state.notes,
    sleepLogs: state.sleepLogs,
    waterLogs: state.waterLogs,
    gymWorkouts: state.gymWorkouts,
    financeEntries: state.financeEntries,
    budgets: state.budgets,
    meals: state.meals,
    nutritionTarget: state.nutritionTarget,
    meditationSessions: state.meditationSessions,
    timeBlocks: state.timeBlocks,
    badHabits: state.badHabits,
    urgeLogs: state.urgeLogs,
    reminders: state.reminders,
    challenges: state.challenges,
  };
}

export function downloadJSON(data: any, filename = 'studio-backup.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(entries: HabitEntry[], habits: Habit[]): string {
  const habitMap = new Map(habits.map(h => [h.id, h]));
  const header = ['date', 'habit', 'type', 'value', 'note'];
  const rows = entries.map(e => [
    e.date,
    habitMap.get(e.habitId)?.name || e.habitId,
    habitMap.get(e.habitId)?.type || '',
    Array.isArray(e.value) ? e.value.join(';') : String(e.value),
    (e.note || '').replace(/"/g, '""'),
  ]);
  return [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
}

export function downloadCSV(csv: string, filename = 'studio-entries.csv') {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ---- Profile sync ----
export interface SyncPackage {
  version: number;
  kind: 'single-profile' | 'all-profiles';
  profiles: { id: string; name: string; color: string }[];
  exportedAt: string;
  data: Record<string, any>; // profileId -> ExportData
}

export function buildSyncPackage(): SyncPackage {
  const profiles: { id: string; name: string; color: string }[] = [];
  const data: Record<string, any> = {};
  // include metadata
  try {
    const raw = localStorage.getItem('studio-profiles');
    if (raw) {
      const arr = JSON.parse(raw);
      for (const p of arr) profiles.push({ id: p.id, name: p.name, color: p.color });
    }
  } catch {}
  for (const p of profiles) {
    const raw = localStorage.getItem(`studio-habit-tracker:${p.id}`);
    if (raw) data[p.id] = raw; // raw persisted zustand chunk, written back verbatim on import
  }
  return { version: 1, kind: 'all-profiles', profiles, exportedAt: new Date().toISOString(), data };
}

export function buildSingleProfileSync(profileId: string): SyncPackage {
  const raw = localStorage.getItem(`studio-habit-tracker:${profileId}`);
  const profilesRaw = localStorage.getItem('studio-profiles');
  let profiles: { id: string; name: string; color: string }[] = [];
  try { if (profilesRaw) profiles = JSON.parse(profilesRaw).filter((p: any) => p.id === profileId); } catch {}
  const data: Record<string, any> = {};
  if (raw) data[profileId] = raw;
  return { version: 1, kind: 'single-profile', profiles, exportedAt: new Date().toISOString(), data };
}

export function applySyncPackage(pkg: SyncPackage) {
  // write profile data chunks (stored as raw zustand-persisted strings)
  for (const [profileId, chunk] of Object.entries(pkg.data)) {
    localStorage.setItem(`studio-habit-tracker:${profileId}`, typeof chunk === 'string' ? chunk : JSON.stringify(chunk));
  }
  // merge profile metadata by id (keep existing entries, preserve createdAt)
  const existing = (() => { try { return JSON.parse(localStorage.getItem('studio-profiles') || '[]'); } catch { return []; } })();
  const merged = [...existing];
  for (const np of pkg.profiles) {
    const idx = merged.findIndex((p: any) => p.id === np.id);
    if (idx >= 0) merged[idx] = { ...merged[idx], name: np.name || merged[idx].name, color: np.color || merged[idx].color };
    else merged.push({ ...np, createdAt: new Date().toISOString() });
  }
  localStorage.setItem('studio-profiles', JSON.stringify(merged));
}

export function downloadSync(pkg: SyncPackage, filename = 'studio-sync.json') {
  downloadJSON(pkg, filename);
}