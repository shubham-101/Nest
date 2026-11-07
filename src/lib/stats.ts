import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { todayStr } from './dates';
import type { Habit, HabitEntry } from '../types';

export const entryValue = (e?: HabitEntry) => {
  if (!e) return null;
  if (typeof e.value === 'boolean') return e.value ? 1 : 0;
  if (Array.isArray(e.value)) return e.value.length;
  return Number(e.value) || 0;
};

export const isCompleted = (habit: Habit, entry?: HabitEntry): boolean => {
  if (!entry) return false;
  switch (habit.type) {
    case 'boolean':
      return entry.value === true;
    case 'numeric':
    case 'duration':
      return (Number(entry.value) || 0) >= (habit.target || 1);
    case 'rating':
    case 'mood':
      return (Number(entry.value) || 0) > 0;
    case 'checklist':
      return Array.isArray(entry.value) && (habit.checklistItems || []).length > 0
        ? entry.value.length >= ((habit.checklistItems || []).length || 1)
        : (Array.isArray(entry.value) && entry.value.length > 0);
    default:
      return !!entry.value;
  }
};

export const streakForHabit = (habit: Habit, entries: HabitEntry[]): number => {
  const dates = new Set(entries.filter(e => e.habitId === habit.id && isCompleted(habit, e)).map(e => e.date));
  const frozen = new Set(habit.frozenDays || []);
  let streak = 0;
  let cur = new Date();
  if (!dates.has(formatDate(cur)) && !frozen.has(formatDate(cur))) {
    cur = new Date(cur.getTime() - 86400000);
  }
  while (dates.has(formatDate(cur)) || frozen.has(formatDate(cur))) {
    streak++;
    cur = new Date(cur.getTime() - 86400000);
  }
  return streak;
};

function formatDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export const longestStreakForHabit = (habit: Habit, entries: HabitEntry[]): number => {
  const dates = entries.filter(e => e.habitId === habit.id && isCompleted(habit, e)).map(e => e.date).sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInCalendarDays(parseISO(dates[i]), parseISO(dates[i - 1]));
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else if (diff > 1) { cur = 1; }
  }
  return best;
};

export const completionRate = (habit: Habit, entries: HabitEntry[], days: number): number => {
  const since = new Date(); since.setDate(since.getDate() - days + 1);
  const sinceStr = format(since, 'yyyy-MM-dd');
  const relevant = entries.filter(e => e.habitId === habit.id && e.date >= sinceStr);
  const completed = relevant.filter(e => isCompleted(habit, e)).length;
  const denom = Math.min(days, differenceInCalendarDays(new Date(), parseISO(habit.createdAt)) + 1);
  return denom > 0 ? completed / denom : 0;
};

export const heatmapData = (entries: HabitEntry[], habits: Habit[], days = 365) => {
  const map: Record<string, number> = {};
  const habitMap = new Map(habits.map(h => [h.id, h]));
  for (const e of entries) {
    const h = habitMap.get(e.habitId);
    if (!h) continue;
    if (isCompleted(h, e)) {
      map[e.date] = (map[e.date] || 0) + 1;
    }
  }
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = format(d, 'yyyy-MM-dd');
    out.push({ date: k, count: map[k] || 0 });
  }
  return out;
};

export const todayProgress = (habits: Habit[], entries: HabitEntry[], date = todayStr()) => {
  const active = habits.filter(h => !h.archived);
  if (!active.length) return { done: 0, total: 0, pct: 0 };
  const done = active.filter(h => {
    const e = entries.find(x => x.habitId === h.id && x.date === date);
    return isCompleted(h, e);
  }).length;
  return { done, total: active.length, pct: done / active.length };
};