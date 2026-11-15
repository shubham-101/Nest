import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

const PRESETS = [
  { label: '15 / 3 Quick', work: 15, break: 3 },
  { label: '25 / 5 Pomodoro', work: 25, break: 5 },
  { label: '40 / 8 Study', work: 40, break: 8 },
  { label: '50 / 10 Deep', work: 50, break: 10 },
  { label: '60 / 15 Sprint', work: 60, break: 15 },
  { label: '90 / 20 Flow', work: 90, break: 20 },
];

const CUSTOM_KEY = 'nest-focus-custom';

export default function Focus() {
  const habits = useStore(s => s.habits);
  const addFocus = useStore(s => s.addFocus);
  const updateFocus = useStore(s => s.updateFocus);
  const focusSessions = useStore(s => s.focusSessions);
  const savedCustom = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; } })();
  const [customs, setCustoms] = useState<{ label: string; work: number; break: number }[]>(savedCustom);
  const [preset, setPreset] = useState(1); // 25 / 5
  const [habitId, setHabitId] = useState('');
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(PRESETS[1].work * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWork, setCustomWork] = useState(45);
  const [customBreak, setCustomBreak] = useState(10);
  const intervalRef = useRef<any>(null);

  const allPresets = [...PRESETS, ...customs];
  const selected = allPresets[Math.min(preset, allPresets.length - 1)];
  const isCustom = preset >= PRESETS.length;

  const total = mode === 'work' ? selected.work * 60 : selected.break * 60;

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
              setSeconds(selected.break * 60);
            } else {
              setMode('work');
              setSeconds(selected.work * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, preset, sessionId, selected]);

  const start = () => {
    if (!running) {
      if (!sessionId && mode === 'work') {
        const id = uid();
        setSessionId(id);
        addFocus({ id, habitId: habitId || undefined, duration: selected.work, startedAt: new Date().toISOString() });
      }
      setRunning(true);
    }
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setMode('work');
    setSeconds(selected.work * 60);
    setSessionId(null);
  };
  const changePreset = (i: number) => {
    reset();
    setPreset(i);
    const p = allPresets[i];
    setSeconds(p.work * 60);
  };
  const deleteCustom = (i: number) => {
    const next = customs.filter((_, j) => j !== i);
    setCustoms(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    if (preset === PRESETS.length + i) { reset(); setPreset(1); setSeconds(PRESETS[1].work * 60); }
    else if (isCustom && preset > PRESETS.length + i) setPreset(p => p - 1);
  };
  const saveCustom = () => {
    if (!customName.trim() || customWork < 1) return;
    const next = [...customs, { label: customName.trim(), work: customWork, break: customBreak }];
    setCustoms(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    setCustomOpen(false);
    setCustomName('');
    const idx = PRESETS.length + next.length - 1;
    reset();
    setPreset(idx);
    setSeconds(next[next.length - 1].work * 60);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const progress = 1 - seconds / total;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl">Focus timer</h1>
      <Card>
        <CardContent className="py-8 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            {allPresets.map((p, i) => (
              <button key={i} onClick={() => changePreset(i)} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${preset === i ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>
                {p.label}
                {i >= PRESETS.length && (
                  <span role="button" aria-label="Delete custom preset" onClick={e => { e.stopPropagation(); deleteCustom(i - PRESETS.length); }} className="opacity-60 hover:opacity-100 text-xs">×</span>
                )}
              </button>
            ))}
            <button onClick={() => setCustomOpen(true)} className="px-3 py-1.5 rounded-lg text-sm border border-dashed border-border text-text-muted hover:text-text hover:border-accent">+ Custom</button>
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

      <Modal open={customOpen} onOpenChange={setCustomOpen} title="Create custom timer">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. 45 / 10 Study session" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Focus minutes</Label>
              <Input type="number" min={1} value={customWork} onChange={e => setCustomWork(Number(e.target.value))} />
            </div>
            <div>
              <Label>Break minutes</Label>
              <Input type="number" min={0} value={customBreak} onChange={e => setCustomBreak(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button onClick={saveCustom}>Save preset</Button>
          </div>
        </div>
      </Modal>

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