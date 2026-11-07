import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, Droplets, Moon, Dumbbell } from 'lucide-react';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full body'];

export default function Wellness() {
  const sleepLogs = useStore(s => s.sleepLogs);
  const waterLogs = useStore(s => s.waterLogs);
  const gymWorkouts = useStore(s => s.gymWorkouts);
  const addSleep = useStore(s => s.addSleepLog);
  const deleteSleep = useStore(s => s.deleteSleepLog);
  const upsertWater = useStore(s => s.upsertWaterLog);
  const addGym = useStore(s => s.addGymWorkout);
  const deleteGym = useStore(s => s.deleteGymWorkout);

  const [sleepOpen, setSleepOpen] = useState(false);
  const [sf, setSf] = useState<any>({ date: todayStr(), bedtime: '23:00', wakeTime: '07:00', quality: 3, note: '' });

  const [gymOpen, setGymOpen] = useState(false);
  const [gf, setGf] = useState<any>({ date: todayStr(), name: '', type: 'strength', duration: 45, notes: '', exercises: [] as any[] });
  const [exDraft, setExDraft] = useState<any>({ name: '', muscleGroup: 'Chest', sets: [{ reps: 10, weight: 0, unit: 'kg' }] });

  const today = todayStr();
  const todayWater = waterLogs.find(w => w.date === today)?.glasses || 0;

  const calcDuration = (b: string, w: string) => {
    const [bh, bm] = b.split(':').map(Number);
    const [wh, wm] = w.split(':').map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return (mins / 60).toFixed(1);
  };

  const addExerciseToDraft = () => {
    if (!exDraft.name.trim()) return;
    setGf({ ...gf, exercises: [...gf.exercises, { ...exDraft, sets: exDraft.sets.map((s: any) => ({ ...s })) }] });
    setExDraft({ name: '', muscleGroup: 'Chest', sets: [{ reps: 10, weight: 0, unit: 'kg' }] });
  };
  const updateSet = (si: number, field: string, value: any) => {
    const sets = [...exDraft.sets];
    sets[si] = { ...sets[si], [field]: value };
    setExDraft({ ...exDraft, sets });
  };
  const addSet = () => setExDraft({ ...exDraft, sets: [...exDraft.sets, { reps: 10, weight: 0, unit: 'kg' }] });
  const removeSet = (si: number) => setExDraft({ ...exDraft, sets: exDraft.sets.filter((_: any, i: number) => i !== si) });
  const removeExercise = (i: number) => setGf({ ...gf, exercises: gf.exercises.filter((_: any, idx: number) => idx !== i) });

  const saveGym = () => {
    if (!gf.name.trim()) return;
    addGym({ ...gf, id: uid(), createdAt: new Date().toISOString() } as any);
    setGymOpen(false);
  };

  const totalVolume = (w: any) => w.exercises.reduce((a: number, e: any) => a + e.sets.reduce((b: number, s: any) => b + s.reps * s.weight, 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Wellness</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Droplets size={16} className="text-blue-500" /> Water today</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-3">{todayWater} <span className="text-base text-text-muted">/ 8 glasses</span></div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => upsertWater({ id: waterLogs.find(w => w.date === today)?.id || uid(), date: today, glasses: todayWater + 1, createdAt: new Date().toISOString() } as any)}>+ Glass</Button>
              <Button size="sm" variant="ghost" onClick={() => upsertWater({ id: waterLogs.find(w => w.date === today)?.id || uid(), date: today, glasses: Math.max(0, todayWater - 1), createdAt: new Date().toISOString() } as any)}>- Glass</Button>
            </div>
            <div className="h-2 rounded-full bg-surface-2 overflow-hidden mt-3">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (todayWater / 8) * 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Moon size={16} className="text-indigo-500" /> Sleep</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={() => { setSf({ date: todayStr(), bedtime: '23:00', wakeTime: '07:00', quality: 3, note: '' }); setSleepOpen(true); }}><Plus size={16} /> Log sleep</Button>
            <div className="mt-3 space-y-2">
              {sleepLogs.slice(0, 7).map(s => (
                <div key={s.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border last:border-0">
                  <span className="font-medium">{s.date}</span>
                  <span className="text-text-muted">{s.bedtime} → {s.wakeTime}</span>
                  <span className="text-text-muted">{calcDuration(s.bedtime, s.wakeTime)}h</span>
                  <span className="text-amber-500">{'★'.repeat(s.quality)}</span>
                  <button onClick={() => deleteSleep(s.id)} className="ml-auto text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                </div>
              ))}
              {sleepLogs.length === 0 && <div className="text-text-muted text-sm">No sleep logs yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gym tracker */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Dumbbell size={16} className="text-orange-500" /> Gym workouts</CardTitle>
          <Button size="sm" onClick={() => { setGf({ date: todayStr(), name: '', type: 'strength', duration: 45, notes: '', exercises: [] }); setExDraft({ name: '', muscleGroup: 'Chest', sets: [{ reps: 10, weight: 0, unit: 'kg' }] }); setGymOpen(true); }}><Plus size={14} /> Log workout</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gymWorkouts.map(w => (
              <div key={w.id} className="border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{w.name || 'Workout'} <span className="text-xs text-text-muted">· {w.type} · {w.duration} min</span></div>
                    <div className="text-xs text-text-muted">{w.date} · {w.exercises.length} exercises · volume {totalVolume(w).toLocaleString()} kg</div>
                  </div>
                  <button onClick={() => deleteGym(w.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
                </div>
                {w.exercises.length > 0 && (
                  <div className="space-y-1.5">
                    {w.exercises.map((e: any, i: number) => (
                      <div key={i} className="text-xs bg-surface-2 rounded-lg px-3 py-2">
                        <div className="font-medium">{e.name} <span className="text-text-muted">· {e.muscleGroup}</span></div>
                        <div className="text-text-muted">{e.sets.map((s: any) => `${s.reps}×${s.weight}${s.unit}`).join('  ')}</div>
                      </div>
                    ))}
                  </div>
                )}
                {w.notes && <div className="text-xs text-text-muted italic">{w.notes}</div>}
              </div>
            ))}
            {gymWorkouts.length === 0 && <div className="text-text-muted text-sm">No workouts logged yet. Start tracking your training!</div>}
          </div>
        </CardContent>
      </Card>

      <Modal open={sleepOpen} onOpenChange={setSleepOpen} title="Log sleep">
        <div className="space-y-4">
          <div><Label>Date</Label><Input type="date" value={sf.date} onChange={e => setSf({ ...sf, date: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Bedtime</Label><Input type="time" value={sf.bedtime} onChange={e => setSf({ ...sf, bedtime: e.target.value })} /></div>
            <div><Label>Wake time</Label><Input type="time" value={sf.wakeTime} onChange={e => setSf({ ...sf, wakeTime: e.target.value })} /></div>
          </div>
          <div>
            <Label>Quality</Label>
            <Select value={String(sf.quality)} onValueChange={v => setSf({ ...sf, quality: Number(v) })} options={[1, 2, 3, 4, 5].map(n => ({ value: String(n), label: '★'.repeat(n) }))} />
          </div>
          <div><Label>Note</Label><Input value={sf.note} onChange={e => setSf({ ...sf, note: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSleepOpen(false)}>Cancel</Button>
            <Button onClick={() => { addSleep({ ...sf, id: uid(), createdAt: new Date().toISOString() } as any); setSleepOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={gymOpen} onOpenChange={setGymOpen} title="Log workout">
        <div className="space-y-4 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={gf.name} onChange={e => setGf({ ...gf, name: e.target.value })} placeholder="Push day" /></div>
            <div><Label>Date</Label><Input type="date" value={gf.date} onChange={e => setGf({ ...gf, date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label><Select value={gf.type} onValueChange={v => setGf({ ...gf, type: v })} options={[{ value: 'strength', label: 'Strength' }, { value: 'cardio', label: 'Cardio' }, { value: 'hiit', label: 'HIIT' }, { value: 'flexibility', label: 'Flexibility' }, { value: 'mixed', label: 'Mixed' }]} /></div>
            <div><Label>Duration (min)</Label><Input type="number" value={gf.duration} onChange={e => setGf({ ...gf, duration: Number(e.target.value) })} /></div>
          </div>

          {/* exercises added */}
          {gf.exercises.length > 0 && (
            <div className="space-y-2">
              <Label>Exercises</Label>
              {gf.exercises.map((e: any, i: number) => (
                <div key={i} className="border border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{e.name} <span className="text-text-muted text-xs">· {e.muscleGroup}</span></span>
                    <button onClick={() => removeExercise(i)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                  </div>
                  <div className="text-xs text-text-muted">{e.sets.map((s: any) => `${s.reps}×${s.weight}${s.unit}`).join('  ')}</div>
                </div>
              ))}
            </div>
          )}

          {/* exercise draft */}
          <div className="border border-dashed border-border rounded-xl p-3 space-y-3">
            <div className="text-sm font-medium">Add exercise</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={exDraft.name} onChange={e => setExDraft({ ...exDraft, name: e.target.value })} placeholder="Bench press" /></div>
              <div><Label>Muscle group</Label><Select value={exDraft.muscleGroup} onValueChange={v => setExDraft({ ...exDraft, muscleGroup: v })} options={MUSCLE_GROUPS.map(g => ({ value: g, label: g }))} /></div>
            </div>
            <div>
              <Label>Sets</Label>
              {exDraft.sets.map((s: any, si: number) => (
                <div key={si} className="flex gap-2 mb-2">
                  <Input type="number" placeholder="reps" value={s.reps} onChange={e => updateSet(si, 'reps', Number(e.target.value))} className="h-8" />
                  <Input type="number" placeholder="weight" value={s.weight} onChange={e => updateSet(si, 'weight', Number(e.target.value))} className="h-8" />
                  <Select value={s.unit} onValueChange={v => updateSet(si, 'unit', v)} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
                  <button onClick={() => removeSet(si)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={addSet}>+ Set</Button>
            </div>
            <Button size="sm" onClick={addExerciseToDraft}>Add exercise</Button>
          </div>

          <div><Label>Notes</Label><Input value={gf.notes} onChange={e => setGf({ ...gf, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setGymOpen(false)}>Cancel</Button>
            <Button onClick={saveGym}>Save workout</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}