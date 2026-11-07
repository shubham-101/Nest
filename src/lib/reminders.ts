import { parseISO, isSameDay, addDays, differenceInCalendarDays, format } from 'date-fns';
import type { Reminder } from '../types';

export const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

/** Does the reminder occur on date `dayKeyStr`? */
export function occursOn(r: Reminder, dayKeyStr: string): boolean {
  const start = parseISO(r.date);
  const day = parseISO(dayKeyStr);
  if (dayKeyStr < r.date) return false;
  if (r.endDate && dayKeyStr > r.endDate) return false;
  switch (r.repeat) {
    case 'none':
      return dayKeyStr === r.date;
    case 'daily':
      return true;
    case 'weekly': {
      if (!r.daysOfWeek || r.daysOfWeek.length === 0) return day.getDay() === start.getDay();
      return r.daysOfWeek.includes(day.getDay());
    }
    case 'monthly':
      return day.getDate() === start.getDate();
    default:
      return false;
  }
}

/** Next occurrence datetime (as Date) at or after `now`. */
export function nextOccurrence(r: Reminder, now: Date = new Date()): Date | null {
  const start = parseISO(r.date);
  // combine date + time
  const [hh, mm] = r.time.split(':').map(Number);
  const base = new Date(start); base.setHours(hh || 0, mm || 0, 0, 0);
  if (r.repeat === 'none') {
    return base >= new Date(now.getTime() - 60_000) ? base : null;
  }
  // search forward up to 400 days
  for (let i = 0; i < 400; i++) {
    const d = addDays(base, i);
    const key = dayKey(d);
    if (!occursOn(r, key)) continue;
    if (r.endDate && key > r.endDate) return null;
    if (d >= now) {
      // for recurring, an occurrence later today still counts
      return d;
    }
  }
  return null;
}

/** All occurrences within a month range (returns set of day keys). */
export function monthOccurrences(r: Reminder, monthCursor: Date): Set<string> {
  const out = new Set<string>();
  // iterate days of displayed month
  const y = monthCursor.getFullYear();
  const m = monthCursor.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (occursOn(r, k)) out.add(k);
  }
  return out;
}

export const isOverdue = (r: Reminder, now: Date = new Date()): boolean => {
  const next = nextOccurrence(r, now);
  return next === null && !r.done && r.repeat === 'none' && parseISO(r.date) < now;
};

export const timeUntil = (d: Date, now: Date = new Date()): string => {
  const diffMin = Math.round((d.getTime() - now.getTime()) / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ${diffMin % 60}m`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}w`;
};

export { isSameDay, differenceInCalendarDays };