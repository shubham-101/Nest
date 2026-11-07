export type HabitType = 'boolean' | 'numeric' | 'duration' | 'mood' | 'rating' | 'checklist';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitCategory =
  | 'design' | 'health' | 'mind' | 'learning' | 'social' | 'creative' | 'productivity' | 'other';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: HabitType;
  category: HabitCategory;
  frequency: HabitFrequency;
  target?: number; // for numeric/duration
  unit?: string; // e.g. minutes, pages
  daysOfWeek?: number[]; // 0-6
  reminderTime?: string; // HH:mm
  stackAfter?: string; // habit id to stack after
  createdAt: string;
  archived: boolean;
  order: number;
  frozenDays?: string[];
  // checklist items template
  checklistItems?: string[];
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number | boolean | string[]; // number for numeric/duration/rating/mood, bool for boolean, array for checklist
  note?: string;
  mood?: number; // 1-5
  energy?: number; // 1-5
  createdAt: string;
}

export interface MoodLog {
  id: string;
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  note?: string;
  createdAt: string;
}

export interface Inspiration {
  id: string;
  title: string;
  url?: string;
  image?: string; // base64 or url
  tags: string[];
  note?: string;
  colorPalette?: string[];
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  tags: string[];
  createdAt: string;
  shipped: boolean;
}

export interface FocusSession {
  id: string;
  habitId?: string;
  duration: number; // minutes
  startedAt: string;
  completedAt?: string;
  note?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: (stats: any) => boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  habitId?: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  createdAt: string;
  completed: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  habits: Omit<Habit, 'id' | 'createdAt' | 'order' | 'archived'>[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  weekStartsOn: 0 | 1;
  notifications: boolean;
  reducedMotion: boolean;
  showXP: boolean;
  name: string;
  onboardingDone: boolean;
  aiProvider: 'none' | 'openai' | 'anthropic';
  aiKey: string;
}

export interface UserStats {
  xp: number;
  level: number;
  totalCompletions: number;
  longestStreak: number;
  badges: string[];
}

// ---- Study tracker ----
export interface StudyTopic {
  id: string;
  name: string;
  subject: string;
  color: string;
  icon: string;
  createdAt: string;
}
export interface StudySession {
  id: string;
  topicId?: string;
  duration: number; // minutes
  notes?: string;
  date: string;
  createdAt: string;
}
export interface StudyResource {
  id: string;
  topicId?: string;
  title: string;
  url?: string;
  type: 'book' | 'article' | 'video' | 'course' | 'other';
  status: 'todo' | 'in-progress' | 'done';
  progress: number; // 0-100
  notes?: string;
  createdAt: string;
}

// ---- Reading ----
export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status: 'want' | 'reading' | 'done';
  currentPage: number;
  totalPages: number;
  rating: number; // 0-5
  notes?: string;
  tags: string[];
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

// ---- Skills ----
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 0-100
  target: number;
  notes?: string;
  createdAt: string;
}
export interface SkillPractice {
  id: string;
  skillId: string;
  duration: number;
  note?: string;
  date: string;
  createdAt: string;
}

// ---- Projects ----
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'idea' | 'active' | 'paused' | 'done';
  progress: number; // 0-100
  color: string;
  deadline?: string;
  tags: string[];
  createdAt: string;
}
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  dueDate?: string;
  createdAt: string;
}
export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  done: boolean;
  priority: 'low' | 'med' | 'high';
  createdAt: string;
}

// ---- Journal / Notes ----
export interface GratitudeEntry {
  id: string;
  date: string;
  items: string[];
  note?: string;
  createdAt: string;
}
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Wellness ----
export interface SleepLog {
  id: string;
  date: string;
  bedtime: string; // HH:mm
  wakeTime: string;
  quality: number; // 1-5
  note?: string;
  createdAt: string;
}
export interface WaterLog {
  id: string;
  date: string;
  glasses: number;
  createdAt: string;
}

// ---- Gym ----
export interface GymSet {
  reps: number;
  weight: number;
  unit: 'kg' | 'lb';
}
export interface GymExercise {
  name: string;
  muscleGroup: string;
  sets: GymSet[];
  notes?: string;
}
export interface GymWorkout {
  id: string;
  date: string;
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';
  duration: number; // minutes
  exercises: GymExercise[];
  notes?: string;
  createdAt: string;
}

// ---- Finance ----
export interface FinanceEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note?: string;
  createdAt: string;
}
export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
  createdAt: string;
}

// ---- Nutrition ----
export interface Meal {
  id: string;
  date: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  createdAt: string;
}
export interface NutritionTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ---- Meditation ----
export interface MeditationSession {
  id: string;
  date: string;
  duration: number; // minutes
  type: 'mindfulness' | 'breathing' | 'body-scan' | 'loving-kindness' | 'other';
  note?: string;
  createdAt: string;
}

// ---- Time blocking ----
export interface TimeBlock {
  id: string;
  date: string;
  start: string; // HH:mm
  end: string; // HH:mm
  title: string;
  color: string;
  note?: string;
  createdAt: string;
}

// ---- Quit bad habits ----
export interface BadHabit {
  id: string;
  name: string;
  icon: string;
  color: string;
  reason: string; // why quit
  triggers: string[];
  replacementHabitId?: string;
  costPerOccurrence: number; // money saved per avoided occurrence
  currency: string;
  startDate: string; // when started quitting
  targetDays: number; // goal days clean
  archived: boolean;
  createdAt: string;
}
export interface UrgeLog {
  id: string;
  badHabitId: string;
  date: string;
  intensity: number; // 1-5
  trigger?: string;
  note?: string;
  resisted: boolean; // true = resisted, false = gave in (relapse)
  createdAt: string;
}

// ---- Reminders ----
export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';
export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (start)
  time: string; // HH:mm
  repeat: ReminderRepeat;
  daysOfWeek?: number[]; // for weekly
  endDate?: string;
  linkedHabitId?: string;
  linkedProjectId?: string;
  note?: string;
  done: boolean;
  snoozedUntil?: string; // ISO
  createdAt: string;
}

// ---- Challenges ----
export interface Challenge {
  id: string;
  name: string;
  description?: string;
  habitId?: string;
  duration: number; // days
  startDate: string;
  completedDays: string[];
  createdAt: string;
}