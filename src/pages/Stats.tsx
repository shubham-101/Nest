import { useStore } from '../store/useStore';
import { isCompleted, streakForHabit, longestStreakForHabit, completionRate } from '../lib/stats';
import { lastNDays } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#0f766e','#7c3aed','#2563eb','#d97706','#16a34a','#dc2626','#db2777','#0891b2'];

export default function Stats() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const stats = useStore(s => s.stats);
  const active = habits.filter(h => !h.archived);

  // daily completion trend last 30 days
  const days = lastNDays(30);
  const trend = days.map(d => {
    const done = active.filter(h => {
      const e = entries.find(x => x.habitId === h.id && x.date === d);
      return isCompleted(h, e);
    }).length;
    return { date: d.slice(5), done, total: active.length };
  });

  // per-habit completion rate (last 30)
  const habitRates = active.map(h => ({
    name: h.name.length > 14 ? h.name.slice(0, 14) + '…' : h.name,
    rate: Math.round(completionRate(h, entries, 30) * 100),
  })).sort((a, b) => b.rate - a.rate);

  // category breakdown
  const catMap: Record<string, number> = {};
  for (const e of entries) {
    const h = habits.find(x => x.id === e.habitId);
    if (h && isCompleted(h, e)) catMap[h.category] = (catMap[h.category] || 0) + 1;
  }
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // streaks table
  const streakRows = active.map(h => ({
    name: h.name, icon: h.icon, current: streakForHabit(h, entries), best: longestStreakForHabit(h, entries),
  })).sort((a, b) => b.current - a.current);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Stats & analytics</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Level" value={stats.level} sub={`${stats.xp} XP`} />
        <StatCard label="Completions" value={stats.totalCompletions} />
        <StatCard label="Longest streak" value={stats.longestStreak} sub="days" />
        <StatCard label="Active habits" value={active.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Daily completions (30 days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="done" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Completion rate by habit (30d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(200, habitRates.length * 28)}>
              <BarChart data={habitRates} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Bar dataKey="rate" fill="var(--color-accent)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Completions by category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Streaks</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="text-text-muted text-left"><th className="py-2">Habit</th><th>Current</th><th>Best</th></tr></thead>
            <tbody>
              {streakRows.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-2">{r.icon} {r.name}</td>
                  <td>{r.current} 🔥</td>
                  <td>{r.best}</td>
                </tr>
              ))}
              {streakRows.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-text-muted">No habits.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="text-xs text-text-muted">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-text-muted">{sub}</div>}
      </CardContent>
    </Card>
  );
}