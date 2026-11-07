import { format, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, subDays, differenceInCalendarDays, startOfMonth, endOfMonth, addDays } from 'date-fns';

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export const fmtDate = (d: string | Date, f = 'MMM d, yyyy') =>
  format(typeof d === 'string' ? parseISO(d) : d, f);

export const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

export const lastNDays = (n: number) => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map(dayKey);
};

export const weekRange = (d: Date, weekStartsOn: 0 | 1 = 1) => {
  const start = startOfWeek(d, { weekStartsOn });
  const end = endOfWeek(d, { weekStartsOn });
  return { start: dayKey(start), end: dayKey(end) };
};

export const monthDays = (d: Date) => eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) }).map(dayKey);

export { isToday, isYesterday, differenceInCalendarDays, addDays, parseISO, format };