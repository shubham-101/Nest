import { useStore } from '../store/useStore';
import { fmtDate } from '../lib/dates';
import { streakForHabit, todayProgress } from '../lib/stats';
import { generateInsights, weeklySummary } from '../lib/ai';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HabitRow } from '../components/HabitRow';
import { MoodWidget } from '../components/MoodWidget';
import { Flame, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);
  const stats = useStore(s => s.stats);
  const active = habits.filter(h => !h.archived);
  const tp = todayProgress(active, entries);
  const insights = generateInsights(habits, entries);
  const ws = weeklySummary(habits, entries);

  const longestStreak = active.reduce((m, h) => Math.max(m, streakForHabit(h, entries)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Good {greeting()}, {settings.name || 'designer'}.</h1>
          <p className="text-text-muted mt-1">{fmtDate(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-text-muted">Today</div>
            <div className="font-semibold">{tp.done}/{tp.total} done</div>
          </div>
          <div className="h-12 w-12 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold">
            {Math.round(tp.pct * 100)}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily progress</span>
            <span className="text-sm text-text-muted">{tp.done} of {tp.total}</span>
          </div>
          <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${tp.pct * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center"><Flame size={22} /></div>
            <div>
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-xs text-text-muted">Longest streak (days)</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center"><Target size={22} /></div>
            <div>
              <div className="text-2xl font-bold">{stats.level}</div>
              <div className="text-xs text-text-muted">Level · {stats.xp} XP</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center"><TrendingUp size={22} /></div>
            <div>
              <div className="text-2xl font-bold">{stats.totalCompletions}</div>
              <div className="text-xs text-text-muted">Total completions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Today's habits</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.assign('/habits')}>+ Add</Button>
          </div>
          {active.length === 0 && (
            <Card className="p-8 text-center text-text-muted">No habits yet. Add one in Habits.</Card>
          )}
          {active.map(h => (
            <HabitRow key={h.id} habit={h} />
          ))}
        </div>
        <div className="space-y-6">
          <MoodWidget />
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-accent" /> Coach insights</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {insights.map((t, i) => (
                <div key={i} className="text-sm text-text-muted leading-relaxed">• {t}</div>
              ))}
              <div className="pt-2 border-t border-border text-sm">{ws}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}