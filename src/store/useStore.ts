import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActiveProfileId, ensureDefaultProfile } from '../lib/profiles';

// Run legacy migration BEFORE the store is created, so rehydration sees the data.
ensureDefaultProfile();
import type {
  Habit, HabitEntry, MoodLog, Inspiration, PortfolioItem,
  FocusSession, Goal, AppSettings, UserStats, Template,
  StudyTopic, StudySession, StudyResource, Book, Skill, SkillPractice,
  Project, Milestone, ProjectTask, GratitudeEntry, Note, SleepLog, WaterLog, Challenge,
  GymWorkout, FinanceEntry, Budget, Meal, NutritionTarget, MeditationSession, TimeBlock,
  BadHabit, UrgeLog, Reminder,
} from '../types';

interface State {
  habits: Habit[];
  entries: HabitEntry[];
  moods: MoodLog[];
  inspirations: Inspiration[];
  portfolio: PortfolioItem[];
  focusSessions: FocusSession[];
  goals: Goal[];
  settings: AppSettings;
  stats: UserStats;
  templates: Template[];
  // study
  studyTopics: StudyTopic[];
  studySessions: StudySession[];
  studyResources: StudyResource[];
  // reading
  books: Book[];
  // skills
  skills: Skill[];
  skillPractices: SkillPractice[];
  // projects
  projects: Project[];
  milestones: Milestone[];
  projectTasks: ProjectTask[];
  // journal
  gratitudes: GratitudeEntry[];
  notes: Note[];
  // wellness
  sleepLogs: SleepLog[];
  waterLogs: WaterLog[];
  gymWorkouts: GymWorkout[];
  // finance
  financeEntries: FinanceEntry[];
  budgets: Budget[];
  // nutrition
  meals: Meal[];
  nutritionTarget: NutritionTarget;
  // meditation
  meditationSessions: MeditationSession[];
  // time blocking
  timeBlocks: TimeBlock[];
  // quit bad habits
  badHabits: BadHabit[];
  urgeLogs: UrgeLog[];
  // reminders
  reminders: Reminder[];
  // challenges
  challenges: Challenge[];

  // habit actions
  addHabit: (h: Habit) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string, archived: boolean) => void;
  reorderHabits: (ids: string[]) => void;
  upsertEntry: (e: HabitEntry) => void;
  deleteEntry: (id: string) => void;
  addMood: (m: MoodLog) => void;
  upsertMood: (m: MoodLog) => void;
  deleteMood: (id: string) => void;
  addInspiration: (i: Inspiration) => void;
  updateInspiration: (id: string, patch: Partial<Inspiration>) => void;
  deleteInspiration: (id: string) => void;
  addPortfolio: (p: PortfolioItem) => void;
  updatePortfolio: (id: string, patch: Partial<PortfolioItem>) => void;
  deletePortfolio: (id: string) => void;
  addFocus: (f: FocusSession) => void;
  updateFocus: (id: string, patch: Partial<FocusSession>) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateStats: (patch: Partial<UserStats>) => void;
  resetAll: () => void;
  importData: (data: any) => void;

  // study
  addStudyTopic: (t: StudyTopic) => void;
  updateStudyTopic: (id: string, patch: Partial<StudyTopic>) => void;
  deleteStudyTopic: (id: string) => void;
  addStudySession: (s: StudySession) => void;
  deleteStudySession: (id: string) => void;
  addStudyResource: (r: StudyResource) => void;
  updateStudyResource: (id: string, patch: Partial<StudyResource>) => void;
  deleteStudyResource: (id: string) => void;
  // reading
  addBook: (b: Book) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  // skills
  addSkill: (s: Skill) => void;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addSkillPractice: (p: SkillPractice) => void;
  deleteSkillPractice: (id: string) => void;
  // projects
  addProject: (p: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMilestone: (m: Milestone) => void;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  addProjectTask: (t: ProjectTask) => void;
  updateProjectTask: (id: string, patch: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;
  // journal
  addGratitude: (g: GratitudeEntry) => void;
  deleteGratitude: (id: string) => void;
  addNote: (n: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // wellness
  addSleepLog: (s: SleepLog) => void;
  deleteSleepLog: (id: string) => void;
  upsertWaterLog: (w: WaterLog) => void;
  addGymWorkout: (w: GymWorkout) => void;
  updateGymWorkout: (id: string, patch: Partial<GymWorkout>) => void;
  deleteGymWorkout: (id: string) => void;
  // finance
  addFinanceEntry: (e: FinanceEntry) => void;
  deleteFinanceEntry: (id: string) => void;
  addBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  // nutrition
  addMeal: (m: Meal) => void;
  deleteMeal: (id: string) => void;
  updateNutritionTarget: (t: Partial<NutritionTarget>) => void;
  // meditation
  addMeditation: (m: MeditationSession) => void;
  deleteMeditation: (id: string) => void;
  // time blocking
  addTimeBlock: (b: TimeBlock) => void;
  updateTimeBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  // reminders
  addReminder: (r: Reminder) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  snoozeReminder: (id: string, until: string) => void;
  // quit bad habits
  addBadHabit: (b: BadHabit) => void;
  updateBadHabit: (id: string, patch: Partial<BadHabit>) => void;
  deleteBadHabit: (id: string) => void;
  addUrgeLog: (u: UrgeLog) => void;
  deleteUrgeLog: (id: string) => void;
  // challenges
  addChallenge: (c: Challenge) => void;
  updateChallenge: (id: string, patch: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#0f766e',
  weekStartsOn: 1,
  notifications: false,
  reducedMotion: false,
  showXP: true,
  name: '',
  onboardingDone: false,
  aiProvider: 'none',
  aiKey: '',
};

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  totalCompletions: 0,
  longestStreak: 0,
  badges: [],
};

const mk = (set: any, key: string, mode: 'append' | 'prepend' = 'append') => (item: any) =>
  set((s: any) => ({ [key]: mode === 'prepend' ? [item, ...s[key]] : [...s[key], item] }));

export const useStore = create<State>()(
  persist(
    (set) => ({
      habits: [],
      entries: [],
      moods: [],
      inspirations: [],
      portfolio: [],
      focusSessions: [],
      goals: [],
      settings: defaultSettings,
      stats: defaultStats,
      templates: [],
      studyTopics: [],
      studySessions: [],
      studyResources: [],
      books: [],
      skills: [],
      skillPractices: [],
      projects: [],
      milestones: [],
      projectTasks: [],
      gratitudes: [],
      notes: [],
      sleepLogs: [],
      waterLogs: [],
      gymWorkouts: [],
      financeEntries: [],
      budgets: [],
      meals: [],
      nutritionTarget: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      meditationSessions: [],
      timeBlocks: [],
      badHabits: [],
      urgeLogs: [],
      reminders: [],
      challenges: [],

      addHabit: mk(set, 'habits'),
      updateHabit: (id, patch) => set((s: any) => ({ habits: s.habits.map((h: any) => h.id === id ? { ...h, ...patch } : h) })),
      deleteHabit: (id) => set((s: any) => ({ habits: s.habits.filter((h: any) => h.id !== id), entries: s.entries.filter((e: any) => e.habitId !== id) })),
      archiveHabit: (id, archived) => set((s: any) => ({ habits: s.habits.map((h: any) => h.id === id ? { ...h, archived } : h) })),
      reorderHabits: (ids) => set((s: any) => ({ habits: ids.map((id, i) => {
        const h = s.habits.find((x: any) => x.id === id)!;
        return { ...h, order: i };
      }) })),
      upsertEntry: (e) => set((s: any) => {
        const idx = s.entries.findIndex((x: any) => x.id === e.id || (x.habitId === e.habitId && x.date === e.date));
        if (idx >= 0) {
          const next = [...s.entries];
          next[idx] = { ...next[idx], ...e };
          return { entries: next };
        }
        return { entries: [...s.entries, e] };
      }),
      deleteEntry: (id) => set((s: any) => ({ entries: s.entries.filter((e: any) => e.id !== id) })),
      addMood: mk(set, 'moods'),
      upsertMood: (m) => set((s: any) => {
        const idx = s.moods.findIndex((x: any) => x.id === m.id || x.date === m.date);
        if (idx >= 0) {
          const next = [...s.moods];
          next[idx] = { ...next[idx], ...m };
          return { moods: next };
        }
        return { moods: [...s.moods, m] };
      }),
      deleteMood: (id) => set((s: any) => ({ moods: s.moods.filter((m: any) => m.id !== id) })),
      addInspiration: mk(set, 'inspirations', 'prepend'),
      updateInspiration: (id, patch) => set((s: any) => ({ inspirations: s.inspirations.map((i: any) => i.id === id ? { ...i, ...patch } : i) })),
      deleteInspiration: (id) => set((s: any) => ({ inspirations: s.inspirations.filter((i: any) => i.id !== id) })),
      addPortfolio: mk(set, 'portfolio', 'prepend'),
      updatePortfolio: (id, patch) => set((s: any) => ({ portfolio: s.portfolio.map((p: any) => p.id === id ? { ...p, ...patch } : p) })),
      deletePortfolio: (id) => set((s: any) => ({ portfolio: s.portfolio.filter((p: any) => p.id !== id) })),
      addFocus: mk(set, 'focusSessions', 'prepend'),
      updateFocus: (id, patch) => set((s: any) => ({ focusSessions: s.focusSessions.map((f: any) => f.id === id ? { ...f, ...patch } : f) })),
      addGoal: mk(set, 'goals', 'prepend'),
      updateGoal: (id, patch) => set((s: any) => ({ goals: s.goals.map((g: any) => g.id === id ? { ...g, ...patch } : g) })),
      deleteGoal: (id) => set((s: any) => ({ goals: s.goals.filter((g: any) => g.id !== id) })),
      updateSettings: (patch) => set((s: any) => ({ settings: { ...s.settings, ...patch } })),
      updateStats: (patch) => set((s: any) => ({ stats: { ...s.stats, ...patch } })),
      resetAll: () => set({
        habits: [], entries: [], moods: [], inspirations: [], portfolio: [], focusSessions: [], goals: [],
        settings: defaultSettings, stats: defaultStats, templates: [],
        studyTopics: [], studySessions: [], studyResources: [], books: [], skills: [], skillPractices: [],
        projects: [], milestones: [], projectTasks: [], gratitudes: [], notes: [], sleepLogs: [], waterLogs: [],
        gymWorkouts: [], financeEntries: [], budgets: [], meals: [], nutritionTarget: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
        meditationSessions: [], timeBlocks: [], badHabits: [], urgeLogs: [], reminders: [], challenges: [],
      }),
      importData: (data) => set(() => ({ ...data })),

      // study
      addStudyTopic: mk(set, 'studyTopics', 'prepend'),
      updateStudyTopic: (id, patch) => set((s: any) => ({ studyTopics: s.studyTopics.map((t: any) => t.id === id ? { ...t, ...patch } : t) })),
      deleteStudyTopic: (id) => set((s: any) => ({ studyTopics: s.studyTopics.filter((t: any) => t.id !== id), studySessions: s.studySessions.filter((x: any) => x.topicId !== id), studyResources: s.studyResources.filter((x: any) => x.topicId !== id) })),
      addStudySession: mk(set, 'studySessions', 'prepend'),
      deleteStudySession: (id) => set((s: any) => ({ studySessions: s.studySessions.filter((x: any) => x.id !== id) })),
      addStudyResource: mk(set, 'studyResources', 'prepend'),
      updateStudyResource: (id, patch) => set((s: any) => ({ studyResources: s.studyResources.map((r: any) => r.id === id ? { ...r, ...patch } : r) })),
      deleteStudyResource: (id) => set((s: any) => ({ studyResources: s.studyResources.filter((r: any) => r.id !== id) })),

      // reading
      addBook: mk(set, 'books', 'prepend'),
      updateBook: (id, patch) => set((s: any) => ({ books: s.books.map((b: any) => b.id === id ? { ...b, ...patch } : b) })),
      deleteBook: (id) => set((s: any) => ({ books: s.books.filter((b: any) => b.id !== id) })),

      // skills
      addSkill: mk(set, 'skills', 'prepend'),
      updateSkill: (id, patch) => set((s: any) => ({ skills: s.skills.map((s: any) => s.id === id ? { ...s, ...patch } : s) })),
      deleteSkill: (id) => set((s: any) => ({ skills: s.skills.filter((s: any) => s.id !== id), skillPractices: s.skillPractices.filter((p: any) => p.skillId !== id) })),
      addSkillPractice: mk(set, 'skillPractices', 'prepend'),
      deleteSkillPractice: (id) => set((s: any) => ({ skillPractices: s.skillPractices.filter((p: any) => p.id !== id) })),

      // projects
      addProject: mk(set, 'projects', 'prepend'),
      updateProject: (id, patch) => set((s: any) => ({ projects: s.projects.map((p: any) => p.id === id ? { ...p, ...patch } : p) })),
      deleteProject: (id) => set((s: any) => ({ projects: s.projects.filter((p: any) => p.id !== id), milestones: s.milestones.filter((m: any) => m.projectId !== id), projectTasks: s.projectTasks.filter((t: any) => t.projectId !== id) })),
      addMilestone: mk(set, 'milestones', 'prepend'),
      updateMilestone: (id, patch) => set((s: any) => ({ milestones: s.milestones.map((m: any) => m.id === id ? { ...m, ...patch } : m) })),
      deleteMilestone: (id) => set((s: any) => ({ milestones: s.milestones.filter((m: any) => m.id !== id) })),
      addProjectTask: mk(set, 'projectTasks', 'prepend'),
      updateProjectTask: (id, patch) => set((s: any) => ({ projectTasks: s.projectTasks.map((t: any) => t.id === id ? { ...t, ...patch } : t) })),
      deleteProjectTask: (id) => set((s: any) => ({ projectTasks: s.projectTasks.filter((t: any) => t.id !== id) })),

      // journal
      addGratitude: mk(set, 'gratitudes', 'prepend'),
      deleteGratitude: (id) => set((s: any) => ({ gratitudes: s.gratitudes.filter((g: any) => g.id !== id) })),
      addNote: mk(set, 'notes', 'prepend'),
      updateNote: (id, patch) => set((s: any) => ({ notes: s.notes.map((n: any) => n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n) })),
      deleteNote: (id) => set((s: any) => ({ notes: s.notes.filter((n: any) => n.id !== id) })),

      // wellness
      addSleepLog: mk(set, 'sleepLogs', 'prepend'),
      deleteSleepLog: (id) => set((s: any) => ({ sleepLogs: s.sleepLogs.filter((s: any) => s.id !== id) })),
      upsertWaterLog: (w) => set((s: any) => {
        const idx = s.waterLogs.findIndex((x: any) => x.date === w.date);
        if (idx >= 0) { const next = [...s.waterLogs]; next[idx] = { ...next[idx], ...w }; return { waterLogs: next }; }
        return { waterLogs: [w, ...s.waterLogs] };
      }),
      addGymWorkout: mk(set, 'gymWorkouts', 'prepend'),
      updateGymWorkout: (id, patch) => set((s: any) => ({ gymWorkouts: s.gymWorkouts.map((w: any) => w.id === id ? { ...w, ...patch } : w) })),
      deleteGymWorkout: (id) => set((s: any) => ({ gymWorkouts: s.gymWorkouts.filter((w: any) => w.id !== id) })),

      addFinanceEntry: mk(set, 'financeEntries', 'prepend'),
      deleteFinanceEntry: (id) => set((s: any) => ({ financeEntries: s.financeEntries.filter((e: any) => e.id !== id) })),
      addBudget: mk(set, 'budgets', 'prepend'),
      deleteBudget: (id) => set((s: any) => ({ budgets: s.budgets.filter((b: any) => b.id !== id) })),

      addMeal: mk(set, 'meals', 'prepend'),
      deleteMeal: (id) => set((s: any) => ({ meals: s.meals.filter((m: any) => m.id !== id) })),
      updateNutritionTarget: (t) => set((s: any) => ({ nutritionTarget: { ...s.nutritionTarget, ...t } })),

      addMeditation: mk(set, 'meditationSessions', 'prepend'),
      deleteMeditation: (id) => set((s: any) => ({ meditationSessions: s.meditationSessions.filter((m: any) => m.id !== id) })),

      addTimeBlock: mk(set, 'timeBlocks', 'prepend'),
      updateTimeBlock: (id, patch) => set((s: any) => ({ timeBlocks: s.timeBlocks.map((b: any) => b.id === id ? { ...b, ...patch } : b) })),
      deleteTimeBlock: (id) => set((s: any) => ({ timeBlocks: s.timeBlocks.filter((b: any) => b.id !== id) })),

      addReminder: mk(set, 'reminders', 'prepend'),
      updateReminder: (id, patch) => set((s: any) => ({ reminders: s.reminders.map((r: any) => r.id === id ? { ...r, ...patch } : r) })),
      deleteReminder: (id) => set((s: any) => ({ reminders: s.reminders.filter((r: any) => r.id !== id) })),
      snoozeReminder: (id, until) => set((s: any) => ({ reminders: s.reminders.map((r: any) => r.id === id ? { ...r, snoozedUntil: until } : r) })),

      addBadHabit: mk(set, 'badHabits', 'prepend'),
      updateBadHabit: (id, patch) => set((s: any) => ({ badHabits: s.badHabits.map((b: any) => b.id === id ? { ...b, ...patch } : b) })),
      deleteBadHabit: (id) => set((s: any) => ({ badHabits: s.badHabits.filter((b: any) => b.id !== id), urgeLogs: s.urgeLogs.filter((u: any) => u.badHabitId !== id) })),
      addUrgeLog: mk(set, 'urgeLogs', 'prepend'),
      deleteUrgeLog: (id) => set((s: any) => ({ urgeLogs: s.urgeLogs.filter((u: any) => u.id !== id) })),

      // challenges
      addChallenge: mk(set, 'challenges', 'prepend'),
      updateChallenge: (id, patch) => set((s: any) => ({ challenges: s.challenges.map((c: any) => c.id === id ? { ...c, ...patch } : c) })),
      deleteChallenge: (id) => set((s: any) => ({ challenges: s.challenges.filter((c: any) => c.id !== id) })),
    }),
    {
      name: `studio-habit-tracker:${getActiveProfileId()}`,
      partialize: (s) => ({
        habits: s.habits, entries: s.entries, moods: s.moods,
        inspirations: s.inspirations, portfolio: s.portfolio,
        focusSessions: s.focusSessions, goals: s.goals,
        settings: s.settings, stats: s.stats, templates: s.templates,
        studyTopics: s.studyTopics, studySessions: s.studySessions, studyResources: s.studyResources,
        books: s.books, skills: s.skills, skillPractices: s.skillPractices,
        projects: s.projects, milestones: s.milestones, projectTasks: s.projectTasks,
        gratitudes: s.gratitudes, notes: s.notes, sleepLogs: s.sleepLogs, waterLogs: s.waterLogs,
        gymWorkouts: s.gymWorkouts, financeEntries: s.financeEntries, budgets: s.budgets, meals: s.meals,
        nutritionTarget: s.nutritionTarget, meditationSessions: s.meditationSessions, timeBlocks: s.timeBlocks,
        badHabits: s.badHabits, urgeLogs: s.urgeLogs, reminders: s.reminders, challenges: s.challenges,
      }),
    }
  )
);