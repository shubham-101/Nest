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

export async function askAI(provider: string, key: string, prompt: string): Promise<string> {
  if (provider === 'none' || !key) {
    return 'AI not configured. Add an API key in Settings to enable the coach. Meanwhile: ' + TIPS[Math.floor(Math.random() * TIPS.length)];
  }
  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response.';
    }
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || 'No response.';
    }
  } catch (e: any) {
    return 'AI request failed: ' + (e?.message || e);
  }
  return 'Unknown provider.';
}