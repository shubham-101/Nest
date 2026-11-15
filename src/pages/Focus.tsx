import { useState, useEffect, useRef } from 'react';
import { HelpButton } from '../components/HelpButton';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Play, Pause, RotateCcw, Coffee, BellRing, Flag, SkipForward } from 'lucide-react';

const PRESETS = [
  { label: '15 / 3 Quick', work: 15, break: 3 },
  { label: '25 / 5 Pomodoro', work: 25, break: 5 },
  { label: '40 / 8 Study', work: 40, break: 8 },
  { label: '50 / 10 Deep', work: 50, break: 10 },
  { label: '60 / 15 Sprint', work: 60, break: 15 },
  { label: '90 / 20 Flow', work: 90, break: 20 },
];

const CUSTOM_KEY = 'nest-focus-custom';

let ringAudio: HTMLAudioElement | null = null;

export const stopRing = () => {
  try {
    ringAudio?.pause();
    if (ringAudio) ringAudio.currentTime = 0;
  } catch { /* noop */ }
};
const playRing = () => {
  try {
    if (!ringAudio) ringAudio = new Audio('/ring.mp3');
    ringAudio.volume = 0.9;
    ringAudio.currentTime = 0;
    ringAudio.onended = () => document.dispatchEvent(new CustomEvent('nest-ring-ended'));
    ringAudio.onpause = () => document.dispatchEvent(new CustomEvent('nest-ring-ended'));
    void ringAudio.play();
    document.dispatchEvent(new CustomEvent('nest-ring-playing'));
  } catch (e) {
    console.warn('Could not play ring.mp3', e);
  }
};
const warmRing = () => {
  if (!ringAudio) {
    ringAudio = new Audio('/ring.mp3');
    ringAudio.preload = 'auto';
    ringAudio.load();
  }
};

type TimerMode = 'focus' | 'break' | 'done';

export default function Focus() {
  const habits = useStore(s => s.habits);
  const addFocus = useStore(s => s.addFocus);
  const updateFocus = useStore(s => s.updateFocus);
  const focusSessions = useStore(s => s.focusSessions);
  const studyTopics = useStore(s => s.studyTopics);
  const skills = useStore(s => s.skills);
  const books = useStore(s => s.books);
  const addStudySession = useStore(s => s.addStudySession);
  const addSkillPractice = useStore(s => s.addSkillPractice);
  const addReadingSession = useStore(s => s.addReadingSession);
  const addMeditation = useStore(s => s.addMeditation);
  const addGymWorkout = useStore(s => s.addGymWorkout);
  const savedCustom = (() => { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; } })();
  const [customs, setCustoms] = useState<{ label: string; work: number; break: number }[]>(savedCustom);
  const [preset, setPreset] = useState(1); // 25 / 5
  const [cycleCount, setCycleCount] = useState(4);
  const [cyclesLeft, setCyclesLeft] = useState(4);
  const [habitId, setHabitId] = useState('');
  const [mode, setMode] = useState<TimerMode>('focus');
  const [running, setRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(PRESETS[1].work * 60);
  const [breakSeconds, setBreakSeconds] = useState(PRESETS[1].break * 60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [ringPlaying, setRingPlaying] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWork, setCustomWork] = useState(45);
  const [customBreak, setCustomBreak] = useState(10);
  const [logIntent, setLogIntent] = useState<'none' | 'reading' | 'studying' | 'working-out' | 'skill' | 'meditation'>('none');
  const [logTarget, setLogTarget] = useState('');
  // 3rd clock (manual)
  const [softRun, setSoftRun] = useState(false);
  const [softSeconds, setSoftSeconds] = useState(0);
  const [softTotal, setSoftTotal] = useState(60);
  const softRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const onRing = () => setRingPlaying(true);
    const onEnded = () => setRingPlaying(false);
    document.addEventListener('nest-ring-playing', onRing);
    document.addEventListener('nest-ring-ended', onEnded);
    return () => {
      document.removeEventListener('nest-ring-playing', onRing);
      document.removeEventListener('nest-ring-ended', onEnded);
    };
  }, []);

  const stopRingUI = () => {
    stopRing();
    setRingPlaying(false);
  };

  const allPresets = [...PRESETS, ...customs];
  const selected = allPresets[Math.min(preset, allPresets.length - 1)];
  const isCustom = preset >= PRESETS.length;

  // 3rd clock is focus minutes / 10 (min 4 min)
  const softMinutes = Math.max(4, Math.floor(selected.work / 10));
  const softInit = softMinutes * 60;

  useEffect(() => {
    if (!softRun) {
      setSoftTotal(softInit);
      setSoftSeconds(softInit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [softInit]);

  // 3rd clock tick
  useEffect(() => {
    if (!softRun) return;
    softRef.current = setInterval(() => {
      setSoftSeconds(s => {
        if (s <= 1) {
          clearInterval(softRef.current);
          setSoftRun(false);
          playRing();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(softRef.current);
  }, [softRun]);

  const total = mode === 'focus' ? selected.work * 60 : mode === 'break' ? selected.break * 60 : 1;
  const seconds = mode === 'focus' ? focusSeconds : mode === 'break' ? breakSeconds : 0;

  const logCompletion = (durationMin: number) => {
    const date = todayStr();
    switch (logIntent) {
      case 'reading':
        addReadingSession({ id: uid(), bookId: logTarget || undefined, duration: durationMin, date, createdAt: new Date().toISOString() });
        break;
      case 'studying':
        if (!logTarget) break;
        addStudySession({ id: uid(), topicId: logTarget, duration: durationMin, date, notes: 'Logged from Focus timer', createdAt: new Date().toISOString() });
        break;
      case 'working-out':
        addGymWorkout({ id: uid(), date, name: 'Focus workout', type: (logTarget as any) || 'mixed', duration: durationMin, exercises: [], notes: 'Logged from Focus timer', createdAt: new Date().toISOString() });
        break;
      case 'skill':
        if (!logTarget) break;
        addSkillPractice({ id: uid(), skillId: logTarget, duration: durationMin, date, note: 'Logged from Focus timer', createdAt: new Date().toISOString() });
        break;
      case 'meditation':
        addMeditation({ id: uid(), date, duration: durationMin, type: (logTarget as any) || 'mindfulness', note: 'Logged from Focus timer', createdAt: new Date().toISOString() });
        break;
    }
  };

  // ---- ticking engine ----
  useEffect(() => {
    if (!running || (mode !== 'focus' && mode !== 'break')) return;
    intervalRef.current = setInterval(() => {
      if (mode === 'focus') {
        setFocusSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playRing();
            if (sessionId) updateFocus(sessionId, { completedAt: new Date().toISOString() });
            awardXP(25);
            logCompletion(selected.work);
            setCyclesLeft(cyclesLeft - 1);
            setMode('break');
            setBreakSeconds(selected.break * 60);
            setRunning(true); // auto-start break
            return 0;
          }
          return s - 1;
        });
      } else {
        setBreakSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playRing();
            if (cyclesLeft <= 0) {
              setMode('done');
            } else {
              setMode('focus');
              const id = uid();
              setSessionId(id);
              addFocus({ id, habitId: habitId || undefined, duration: selected.work, startedAt: new Date().toISOString() });
              setFocusSeconds(selected.work * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, selected, cyclesLeft, sessionId, habitId, logIntent, logTarget]);

  const start = () => {
    warmRing();
    if (mode === 'done') {
      // restart the whole set
      resetAll();
      return;
    }
    if (!running) {
      if (mode === 'focus' && !sessionId) {
        const id = uid();
        setSessionId(id);
        addFocus({ id, habitId: habitId || undefined, duration: selected.work, startedAt: new Date().toISOString() });
      }
      if (mode === 'break' && cyclesLeft <= 0) {
        // set finished — treat start as restart
        resetAll();
        return;
      }
      setRunning(true);
    }
  };
  const pause = () => setRunning(false);

  const resetAll = () => {
    stopRingUI();
    clearInterval(softRef.current);
    setSoftRun(false);
    setSoftTotal(softInit);
    setSoftSeconds(softInit);
    setRunning(false);
    setMode('focus');
    setCyclesLeft(cycleCount);
    setSessionId(null);
    setFocusSeconds(selected.work * 60);
    setBreakSeconds(selected.break * 60);
  };

  const changePreset = (i: number) => {
    const p = allPresets[i];
    setPreset(i);
    setRunning(false);
    setMode('focus');
    setCyclesLeft(cycleCount);
    setSessionId(null);
    setFocusSeconds(p.work * 60);
    setBreakSeconds(p.break * 60);
  };

  const setTotal = (n: number) => {
    const val = Math.max(1, Math.min(20, Math.floor(n) || 1));
    setCycleCount(val);
    setCyclesLeft(val);
  };

  const startSoft = () => {
    warmRing();
    setRunning(false); // stop focus clock
    clearInterval(intervalRef.current);
    if (softSeconds <= 0) {
      setSoftSeconds(softInit);
      setSoftTotal(softInit);
    }
    setSoftRun(true);
  };
  const pauseSoft = () => setSoftRun(false);
  const resetSoft = () => { setSoftRun(false); setSoftTotal(softInit); setSoftSeconds(softInit); };

  const skipBreak = () => {
    if (mode !== 'break') return;
    stopRingUI();
    setRunning(false);
    if (cyclesLeft <= 0) { setMode('done'); return; }
    setMode('focus');
    const id = uid();
    setSessionId(id);
    addFocus({ id, habitId: habitId || undefined, duration: selected.work, startedAt: new Date().toISOString() });
    setFocusSeconds(selected.work * 60);
  };

  const addBreak = (mins: number) => setBreakSeconds(s => Math.min(99 * 60, s + mins * 60));

  const deleteCustom = (i: number) => {
    const next = customs.filter((_, j) => j !== i);
    setCustoms(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    if (preset === PRESETS.length + i) { changePreset(1); }
    else if (isCustom && preset > PRESETS.length + i) setPreset(p => p - 1);
  };
  const saveCustom = () => {
    warmRing();
    if (!customName.trim() || customWork < 1) return;
    const next = [...customs, { label: customName.trim(), work: customWork, break: customBreak }];
    setCustoms(next);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
    setCustomOpen(false);
    setCustomName('');
    const idx = PRESETS.length + next.length - 1;
    resetAll();
    setPreset(idx);
    setFocusSeconds(next[next.length - 1].work * 60);
    setBreakSeconds(next[next.length - 1].break * 60);
  };

  const skipForward = () => {
    if (mode === 'focus') {
      stopRingUI();
      clearInterval(intervalRef.current);
      setRunning(false);
      setMode('break');
      setBreakSeconds(selected.break * 60);
      if (sessionId) updateFocus(sessionId, { completedAt: new Date().toISOString() });
      awardXP(25);
      setCyclesLeft(l => l - 1);
    }
  };

  const doneCount = cycleCount - cyclesLeft;

  const progress = 1 - seconds / total;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <span className="flex items-center gap-2"><h1 className="font-display text-3xl">Focus timer</h1><HelpButton pageKey="focus" /></span>
      <Card>
        <CardContent className="py-7 text-center space-y-5">
          {/* preset ladder */}
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

          {/* intended cycles (user sets this before starting) */}
          <div className="flex items-center justify-center gap-2">
            <Label className="text-xs text-text-muted">Cycles</Label>
            <button onClick={() => setTotal(cycleCount - 1)} className="h-8 w-8 rounded-lg bg-surface-2 hover:bg-border text-lg">−</button>
            <Input type="number" min={1} max={20} value={cycleCount} onChange={e => setTotal(Number(e.target.value))} className="w-16 h-8 text-center" disabled={running} />
            <button onClick={() => setTotal(cycleCount + 1)} className="h-8 w-8 rounded-lg bg-surface-2 hover:bg-border text-lg">+</button>
          </div>

          {/* cycle progress dots */}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: cycleCount }).map((_, i) => (
              <div key={i} className={`h-3 w-8 rounded-full transition-all ${i < doneCount ? 'bg-accent' : i === doneCount ? 'bg-accent/40 ring-1 ring-accent' : 'bg-surface-2'}`} />
            ))}
          </div>

          {/* THREE CLOCKS */}
          <div className="flex justify-center gap-3 sm:gap-6 flex-wrap">
            {/* FOCUS */}
            <div className={`relative h-40 w-40 sm:h-48 sm:w-48 transition-opacity ${mode === 'focus' ? '' : 'opacity-40'}`}>
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
                {mode === 'focus' && <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeDasharray={`${progress * 289} 289`} strokeLinecap="round" />}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">Focus</div>
                <div className="font-mono text-3xl sm:text-4xl font-bold">{String(Math.floor(focusSeconds / 60)).padStart(2, '0')}:{String(focusSeconds % 60).padStart(2, '0')}</div>
                <div className="text-xs text-text-muted">{Math.min(doneCount + 1, cycleCount)}/{cycleCount}</div>
              </div>
            </div>
            {/* BREAK */}
            <div className={`relative h-40 w-40 sm:h-48 sm:w-48 transition-opacity ${mode === 'break' ? '' : 'opacity-40'}`}>
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
                {mode === 'break' && <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray={`${progress * 289} 289`} strokeLinecap="round" />}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold">Break</div>
                <div className="font-mono text-3xl sm:text-4xl font-bold">{String(Math.floor(breakSeconds / 60)).padStart(2, '0')}:{String(breakSeconds % 60).padStart(2, '0')}</div>
                <div className="text-xs text-text-muted">{cyclesLeft} left</div>
              </div>
            </div>
            {/* SOFT CLOCK — manual start, stops focus */}
            <div className={`relative h-40 w-40 sm:h-48 sm:w-48 transition ${softRun ? '' : 'opacity-70'}`}>
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-surface-2)" strokeWidth="6" />
                {softRun && <circle cx="50" cy="50" r="46" fill="none" stroke="#a78bfa" strokeWidth="6" strokeDasharray={`${(1 - softSeconds / softTotal) * 289} 289`} strokeLinecap="round" />}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold">Soft</div>
                <div className="font-mono text-3xl sm:text-4xl font-bold">{String(Math.floor(softSeconds / 60)).padStart(2, '0')}:{String(softSeconds % 60).padStart(2, '0')}</div>
                <div className="text-xs text-text-muted">manual</div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {!softRun ? (
                  <button onClick={startSoft} className="h-7 w-7 rounded-full bg-violet-500 text-white flex items-center justify-center shadow hover:scale-110 transition" title="Start soft clock (stops focus)"><Play size={12} /></button>
                ) : (
                  <button onClick={pauseSoft} className="h-7 w-7 rounded-full bg-surface text-text-muted border border-border flex items-center justify-center shadow hover:scale-110 transition" title="Pause soft clock"><Pause size={12} /></button>
                )}
                <button onClick={resetSoft} className="h-7 w-7 rounded-full bg-surface text-text-muted border border-border flex items-center justify-center shadow hover:scale-110 transition" title="Reset soft clock"><RotateCcw size={12} /></button>
              </div>
            </div>
          </div>

          {/* extend break time (available whenever break clock exists) */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-text-muted">Break</span>
            <button onClick={() => addBreak(1)} className="h-8 px-3 rounded-lg text-xs bg-surface-2 hover:bg-border font-medium">+1 min</button>
            <button onClick={() => addBreak(5)} className="h-8 px-3 rounded-lg text-xs bg-surface-2 hover:bg-border font-medium">+5 min</button>
            <button onClick={() => addBreak(10)} className="h-8 px-3 rounded-lg text-xs bg-surface-2 hover:bg-border font-medium">+10 min</button>
          </div>

          {mode === 'done' && (
            <div className="text-center space-y-2">
              <Flag className="mx-auto text-accent" size={28} />
              <div className="font-display text-xl">Set complete! 🎉</div>
              <div className="text-sm text-text-muted">{cycleCount} cycles done. Take a longer rest.</div>
            </div>
          )}
          <div className="text-sm text-text-muted">{mode === 'focus' ? 'Deep work' : mode === 'break' ? 'Break' : 'Done'} {habitId && `· ${habits.find(h => h.id === habitId)?.name}`}</div>

          {ringPlaying && (
            <button onClick={stopRingUI} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium shadow hover:opacity-90 transition" aria-label="Stop ring">
              <BellRing size={16} /> Stop ring
            </button>
          )}

          <div className="flex justify-center gap-2 flex-wrap">
            {!running ? (
              <Button size="lg" onClick={start}><Play size={18} /> {mode === 'done' ? 'Start new set' : 'Start'}</Button>
            ) : (
              <Button size="lg" onClick={pause}><Pause size={18} /> Pause</Button>
            )}
            <Button variant="outline" size="lg" onClick={resetAll}><RotateCcw size={18} /> Reset</Button>
            {mode === 'focus' && (
              <Button variant="ghost" size="lg" onClick={skipForward} title="Finish this focus early"><SkipForward size={16} /> Finish focus</Button>
            )}
            {mode === 'break' && (
              <Button variant="ghost" size="lg" onClick={skipBreak} title="Start next focus now"><SkipForward size={16} /> Skip break</Button>
            )}
          </div>

          {/* after focus completes — where to log it? */}
          <div className="max-w-md mx-auto space-y-2">
            <Label className="text-xs text-text-muted">When this focus ends, log it to</Label>
            <Select value={logIntent} onValueChange={v => { setLogIntent(v as any); setLogTarget(''); }} options={[
              { value: 'none', label: 'Don\'t log anywhere' },
              { value: 'reading', label: 'Reading' },
              { value: 'studying', label: 'Studying' },
              { value: 'working-out', label: 'Working out' },
              { value: 'skill', label: 'Skill practice' },
              { value: 'meditation', label: 'Meditation' },
            ]} />
            {logIntent === 'reading' && (
              <Select value={logTarget} onValueChange={setLogTarget} options={[{ value: '', label: 'Reading (general — no book)' }, ...books.map(b => ({ value: b.id, label: b.title }))]} />
            )}
            {logIntent === 'studying' && (
              <Select value={logTarget} onValueChange={setLogTarget} options={[{ value: '', label: 'Pick a study topic…' }, ...studyTopics.map(t => ({ value: t.id, label: t.name }))]} />
            )}
            {logIntent === 'working-out' && (
              <Select value={logTarget || 'strength'} onValueChange={setLogTarget} options={[{ value: 'strength', label: 'Strength' }, { value: 'cardio', label: 'Cardio' }, { value: 'hiit', label: 'HIIT' }, { value: 'flexibility', label: 'Flexibility' }, { value: 'mixed', label: 'Mixed' }]} />
            )}
            {logIntent === 'skill' && (
              <Select value={logTarget} onValueChange={setLogTarget} options={[{ value: '', label: 'Pick a skill…' }, ...skills.map(s => ({ value: s.id, label: s.name }))]} />
            )}
            {logIntent === 'meditation' && (
              <Select value={logTarget || 'mindfulness'} onValueChange={setLogTarget} options={[{ value: 'mindfulness', label: 'Mindfulness' }, { value: 'breathing', label: 'Breathing' }, { value: 'body-scan', label: 'Body scan' }, { value: 'loving-kindness', label: 'Loving kindness' }, { value: 'other', label: 'Other' }]} />
            )}
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