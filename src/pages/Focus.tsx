import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const PRESETS = [
  { label: '25 / 5 Pomodoro', work: 25, break: 5 },
  { label: '50 / 10 Deep', work: 50, break: 10 },
  { label: '15 / 3 Quick', work: 15, break: 3 },
];

export default function Focus() {
  const habits = useStore(s => s.habits);
  const addFocus = useStore(s => s.addFocus);
  const updateFocus = useStore(s => s.updateFocus);
  const focusSessions = useStore(s => s.focusSessions);
  const [preset, setPreset] = useState(0);
  const [habitId, setHabitId] = useState('');
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(PRESETS[0].work * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<any>(null);

  const total = mode === 'work' ? PRESETS[preset].work * 60 : PRESETS[preset].break * 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            if (mode === 'work') {
              // complete
              if (sessionId) updateFocus(sessionId, { completedAt: new Date().toISOString() });
              awardXP(25);
              setMode('break');
              setSeconds(PRESETS[preset].break * 60);
            } else {
              setMode('work');
              setSeconds(PRESETS[preset].work * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, preset, sessionId]);

  const start = () => {
    if (!running) {
      if (!sessionId && mode === 'work') {
        const id = uid();
        setSessionId(id);
        addFocus({ id, habitId: habitId || undefined, duration: PRESETS[preset].work, startedAt: new Date().toISOString() });
      }
      setRunning(true);
    }
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setMode('work');
    setSeconds(PRESETS[preset].work * 60);
    setSessionId(null);
  };
  const changePreset = (i: number) => {
    setPreset(i);
    reset();
    setSeconds(PRESETS[i].work * 60);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = 1 - seconds / total;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl">Focus timer</h1>
      <Card>
        <CardContent className="py-8 text-center space-y-6">
          <div className="flex justify-center gap-2">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => changePreset(i)} className={`px-3 py-1.5 rounded-lg text-sm ${preset === i ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>{p.label}</button>
            ))}
          </div>
          <div className="text-sm text-text-muted">{mode === 'work' ? 'Deep work' : 'Break'} {habitId && `· ${habits.find(h => h.id === habitId)?.name}`}</div>
          <div className="relative mx-auto h-56 w-56">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeDasharray={`${progress * 289} 289`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-5xl font-bold">{mm}:{ss}</div>
          </div>
          <div className="flex justify-center gap-3">
            {!running ? (
              <Button size="lg" onClick={start}><Play size={18} /> Start</Button>
            ) : (
              <Button size="lg" onClick={pause}><Pause size={18} /> Pause</Button>
            )}
            <Button variant="outline" size="lg" onClick={reset}><RotateCcw size={18} /> Reset</Button>
          </div>
          <div className="max-w-xs mx-auto">
            <Select value={habitId} onValueChange={setHabitId} options={[{ value: '', label: 'No habit linked' }, ...habits.filter(h => !h.archived).map(h => ({ value: h.id, label: h.name }))]} placeholder="Link to habit" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Coffee size={16} /> Recent sessions</CardTitle></CardHeader>
        <CardContent>
          {focusSessions.slice(0, 10).map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
              <span className="font-mono">{s.duration}m</span>
              <span className="flex-1 text-text-muted">{s.habitId ? habits.find(h => h.id === s.habitId)?.name : 'Free focus'}</span>
              <span className="text-xs text-text-muted">{new Date(s.startedAt).toLocaleString()}</span>
              {s.completedAt && <span className="text-xs text-accent">✓</span>}
            </div>
          ))}
          {focusSessions.length === 0 && <div className="text-text-muted text-sm">No sessions yet.</div>}
        </CardContent>
      </Card>
    </div>
  );
}

function awardXP(amount: number) {
  const s = useStore.getState();
  const newXp = s.stats.xp + amount;
  s.updateStats({ xp: newXp, level: Math.floor(newXp / 100) + 1 });
}