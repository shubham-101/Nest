import { todayStr } from './dates';
import { format, parseISO } from 'date-fns';
import { isCompleted, streakForHabit, todayProgress } from './stats';
import type { Habit, HabitEntry } from '../types';

export interface CoachMessage {
  role: 'assistant' | 'user';
  text: string;
  ts: string;
}

const TIPS = [
  'Start small: a 2-minute version of a habit beats skipping it.',
  'Habit stacking: attach a new habit to an existing daily cue.',
  'Never miss twice — one miss is an accident, two is a pattern.',
  'Design your environment so the right choice is the easy choice.',
  'Track the process, not just the outcome.',
  'Celebrate tiny wins; momentum compounds.',
  'Reduce friction for good habits, increase friction for bad ones.',
];

export function generateInsights(habits: Habit[], entries: HabitEntry[]): string[] {
  const out: string[] = [];
  const active = habits.filter(h => !h.archived);
  const tp = todayProgress(active, entries);
  if (active.length === 0) {
    out.push('Add your first habit to get started. Try a simple daily one like "Drink water" or "Sketch 10 min".');
    return out;
  }
  if (tp.pct >= 1) out.push('🎉 All habits done today! You earned bonus XP.');
  else if (tp.pct >= 0.5) out.push(`You're ${Math.round(tp.pct * 100)}% through today's habits. Keep the momentum.`);
  else out.push(`Only ${tp.done}/${tp.total} done today. Pick one small habit to start.`);

  // streaks
  const streaks = active.map(h => ({ h, s: streakForHabit(h, entries) })).sort((a, b) => b.s - a.s);
  if (streaks[0] && streaks[0].s >= 3) out.push(`🔥 Longest active streak: ${streaks[0].h.name} at ${streaks[0].s} days.`);
  const weak = active.filter(h => {
    const e = entries.find(x => x.habitId === h.id && x.date === todayStr());
    return !isCompleted(h, e);
  });
  if (weak.length && weak.length <= 3) out.push(`Don't forget: ${weak.map(h => h.name).join(', ')}.`);

  // best day of week
  const byDow: number[] = Array(7).fill(0);
  const tot: number[] = Array(7).fill(0);
  for (const e of entries) {
    const d = parseISO(e.date).getDay();
    tot[d]++;
    const h = habits.find(x => x.id === e.habitId);
    if (h && isCompleted(h, e)) byDow[d]++;
  }
  const best = byDow.map((c, i) => ({ i, r: tot[i] ? c / tot[i] : 0 })).sort((a, b) => b.r - a.r)[0];
  if (best && tot[best.i] > 5) {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    out.push(`Your best day is ${names[best.i]} (${Math.round(best.r * 100)}% completion).`);
  }
  out.push(TIPS[Math.floor(Math.random() * TIPS.length)]);
  return out;
}

export function weeklySummary(habits: Habit[], entries: HabitEntry[]): string {
  const active = habits.filter(h => !h.archived);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const ws = format(weekAgo, 'yyyy-MM-dd');
  const weekEntries = entries.filter(e => e.date >= ws);
  const completed = weekEntries.filter(e => {
    const h = habits.find(x => x.id === e.habitId);
    return h && isCompleted(h, e);
  }).length;
  const total = active.length * 7;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const top = active.map(h => ({
    h,
    c: weekEntries.filter(e => e.habitId === h.id && isCompleted(h, e)).length,
  })).sort((a, b) => b.c - a.c)[0];
  let text = `This week: ${completed} completions (${pct}% of possible).`;
  if (top) text += ` Top habit: ${top.h.name} (${top.c}/7).`;
  if (pct >= 80) text += ' Outstanding consistency!';
  else if (pct >= 50) text += ' Solid progress — aim for one more habit daily.';
  else text += ' Let’s rebuild momentum: pick 2 core habits and nail them.';
  return text;
}

/** ---- The Nest Local Brain ----
 *  A fully on-device reasoning engine. No keys, no server, no network.
 *  Reads your real data and produces specific, data-backed advice.
 */

function lastNDaysStrs(n: number) {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push(format(d, 'yyyy-MM-dd'));
  }
  return out;
}

export interface BrainContext {
  habits: Habit[];
  entries: HabitEntry[];
  moods?: { date: string; mood: number; energy: number; note?: string }[];
  sleep?: { date: string; bedtime: string; wakeTime: string; quality: number }[];
  goals?: { title: string; current: number; target: number; unit?: string; deadline?: string; completed?: boolean }[];
  study?: { duration: number; date: string }[];
  quit?: { name: string; cleanDays?: number }[];
}

export function buildBrain(ctx: BrainContext) {
  const { habits, entries } = ctx;
  const active = habits.filter(h => !h.archived);
  return {
    snapshot() {
      const tp = todayProgress(active, entries);
      const streaks = active.map(h => ({ h, s: streakForHabit(h, entries) })).sort((a, b) => b.s - a.s);
      const longest = streaks[0];
      const completed = entries.filter(e => isCompleted(habits.find(h => h.id === e.habitId)!, e)).length;
      return { active: active.length, tp, longest, completed };
    },
    // days with at least one completion in last N days
    completionDays(n = 30) {
      const days = lastNDaysStrs(n);
      return days.filter(d => active.some(h => isCompleted(h, entries.find(e => e.habitId === h.id && e.date === d)))).length;
    },
    // per-habit stats for last 30 days
    habitStats(n = 30) {
      const since = lastNDaysStrs(n)[0];
      return active.map(h => {
        const recent = entries.filter(e => e.habitId === h.id && e.date >= since);
        const done = recent.filter(e => isCompleted(h, e)).length;
        return { h, done, rate: recent.length ? done / recent.length : 0, streak: streakForHabit(h, entries) };
      }).sort((a, b) => b.rate - a.rate);
    },
    weekdayPattern() {
      const byDow: number[] = Array(7).fill(0);
      const tot: number[] = Array(7).fill(0);
      for (const e of entries) {
        const d = parseISO(e.date).getDay();
        tot[d]++;
        const h = habits.find(x => x.id === e.habitId);
        if (h && isCompleted(h, e)) byDow[d]++;
      }
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return byDow.map((c, i) => ({ day: names[i], rate: tot[i] ? c / tot[i] : 0, n: tot[i] }));
    },
    weakDays() {
      return this.weekdayPattern().filter(d => d.n >= 3 && d.rate < 0.5);
    },
    liability() { return this.habitStats().filter(s => s.rate < 0.4).sort((a, b) => a.rate - b.rate); },
    strengths() { return this.habitStats().filter(s => s.rate >= 0.7).slice(0, 5); },
    moodTrend() {
      const ms = (ctx.moods || []).slice(-14);
      if (!ms.length) return null;
      const avg = ms.reduce((a, m) => a + m.mood, 0) / ms.length;
      const energy = ms.reduce((a, m) => a + (m.energy || 3), 0) / ms.length;
      return { avg: +avg.toFixed(1), energy: +energy.toFixed(1), n: ms.length };
    },
    sleepTrend() {
      const ss = (ctx.sleep || []).slice(-14);
      if (!ss.length) return null;
      const q = ss.reduce((a, s) => a + s.quality, 0) / ss.length;
      return { quality: +q.toFixed(1), n: ss.length };
    },
    weekendEffect() {
      const we = entries.filter(e => [0, 6].includes(parseISO(e.date).getDay()));
      const wd = entries.filter(e => ![0, 6].includes(parseISO(e.date).getDay()));
      const rate = (list: typeof entries) => list.length ? list.filter(e => isCompleted(habits.find(h => h.id === e.habitId)!, e)).length / list.length : 0;
      return { weekend: +rate(we).toFixed(2), weekday: +rate(wd).toFixed(2) };
    },
  };
}

/** Turn the brain's analysis into a readable report of specific findings. */
export function brainReport(ctx: BrainContext): string[] {
  const brain = buildBrain(ctx);
  const findings: string[] = [];
  const { tp } = brain.snapshot();
  findings.push(`Today you've completed ${tp.done}/${tp.total} habits (${Math.round(tp.pct * 100)}%).`);

  const stats = brain.habitStats(30);
  if (stats.length) {
    const star = stats[0];
    findings.push(`Strongest habit: ${star.h.name} — ${star.done} completions, ${Math.round(star.rate * 100)}% consistency (streak ${star.streak}d).`);
    const weak = stats.filter(s => s.rate < 0.5);
    if (weak.length) {
      const w = weak.sort((a, b) => a.rate - b.rate)[0];
      findings.push(`Weakest habit: ${w.h.name} — only ${Math.round(w.rate * 100)}% over 30 days (streak ${w.streak}d).`);
    }
  }
  const weak = brain.weakDays();
  if (weak.length) findings.push(`You slip on ${weak.map(w => w.day).join(' & ')} — consider scheduling your hardest habits for stronger days.`);
  const wf = brain.weekendEffect();
  if (wf.weekday > wf.weekend + 0.15) findings.push(`Weekends drag you down (${Math.round(wf.weekend * 100)}% vs ${Math.round(wf.weekday * 100)}% weekday). Plan weekend check-ins.`);
  const mt = brain.moodTrend();
  if (mt) findings.push(`Mood ${mt.avg}/5, energy ${mt.energy}/5 over the last ${mt.n} logs${mt.avg < 3 ? ' — consider sleep/recovery focus' : ' — you are in good spirits'}.`);
  const st = brain.sleepTrend();
  if (st) findings.push(`Sleep quality ${st.quality}/5 across ${st.n} nights.`);
  const goals = (ctx.goals || []).filter(g => !g.completed);
  if (goals.length) {
    const g = goals[0];
    findings.push(`Goal "${g.title}": ${g.current}/${g.target} ${g.unit || ''} — ${Math.round((g.current / Math.max(1, g.target)) * 100)}% there.`);
  }
  return findings;
}

/** Answer a free-text question using the brain. Lightweight intent matching. */
export function brainAnswer(question: string, ctx: BrainContext): string {
  const brain = buildBrain(ctx);
  const q = question.toLowerCase();
  const finish = (lines: string[]) => lines.filter(Boolean).join('\n');

  if (/(streak|hot|fire)/.test(q)) {
    const stats = brain.habitStats();
    const best = [...stats].sort((a, b) => b.streak - a.streak)[0];
    if (!best || best.streak === 0) return 'No active streaks yet. Complete all of today\'s habits to start one.';
    return `Your longest live streak is ${best.streak} days — ${best.h.name}. Protect it: never miss twice.`;
  }
  if (/(week|7 ?day|last week)/.test(q)) {
    return weeklySummary(ctx.habits, ctx.entries);
  }
  if (/(tomorrow|today|plan|focus)/.test(q)) {
    const weak = brain.liability();
    const top = brain.strengths()[0];
    const lines = ['Here is your battle plan:'];
    if (weak[0]) lines.push(`1. Nail "${weak[0].h.name}" first — it's your anchor.`);
    if (weak[1]) lines.push(`2. Then knock out "${weak[1].h.name}".`);
    if (top) lines.push(`3. Keep momentum on ${top.h.name}.`);
    const mt = brain.moodTrend();
    if (mt && mt.avg < 3.2) lines.push('Energy looks low — lower your ambition bar and win small today.');
    return finish(lines);
  }
  if (/(miss|slip|fail|strugg|hard)/.test(q)) {
    const weak = brain.liability();
    if (!weak.length) return 'Nothing is slipping — you are consistent. Keep going.';
    const w = weak[0];
    return `The friction is "${w.h.name}" (${Math.round(w.rate * 100)}% over 30 days). Shrink it to a 2-minute version and anchor it to an existing daily cue.`;
  }
  if (/(mood|energy|feel|sleep)/.test(q)) {
    const mt = brain.moodTrend();
    const st = brain.sleepTrend();
    const lines = ['Reading your logs:'];
    if (mt) lines.push(`Mood ${mt.avg}/5 · energy ${mt.energy}/5 (last ${mt.n} days)${mt.avg < 3.2 ? ' — schedule recovery' : ' — solid'}`);
    if (st) lines.push(`Sleep quality ${st.quality}/5 across ${st.n} nights${st.quality < 3.5 ? ' — that\'s likely hurting everything else.' : ''}`);
    if (!mt && !st) lines.push('Log mood & energy (and sleep) on the Wellness page — I can then tell you exactly what lifts your performance.');
    return finish(lines);
  }
  if (/(advice|motiv|inspir|start)/.test(q)) {
    return TIPS[Math.floor(Math.random() * TIPS.length)];
  }
  if (/(report|summary|overview)/.test(q)) {
    return finish(brainReport(ctx));
  }
  if (/(goal)/.test(q)) {
    const goals = ctx.goals || [];
    if (!goals.length) return 'No goals set. Add one on the Goals page to track measurable outcomes.';
    return "Your active goals:\n" + goals.slice(0, 5).map(g => `• ${g.title}: ${g.current}/${g.target} ${g.unit || ''}`).join('\n');
  }
  // default: give the full brain readout
  return "Here's what your data says:\n" + finish(brainReport(ctx)) + "\n\nAsk me about: streaks · weekly summary · my plan · why I slip · mood/energy/sleep · goals · summary";
}

/** Local coach — drop-in replacement for cloud askAI. */
export async function askAI(_provider: string, _key: string, _prompt: string, ctx?: BrainContext): Promise<string> {
  if (ctx) return brainAnswer(_prompt, ctx);
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}