import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { format, parseISO } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, Flame } from 'lucide-react';

export default function Challenges() {
  const challenges = useStore(s => s.challenges);
  const habits = useStore(s => s.habits);
  const addChallenge = useStore(s => s.addChallenge);
  const updateChallenge = useStore(s => s.updateChallenge);
  const deleteChallenge = useStore(s => s.deleteChallenge);

  const [open, setOpen] = useState(false);
  const [f, setF] = useState<any>({ name: '', description: '', habitId: '', duration: 30, startDate: todayStr() });

  const toggleDay = (c: any, day: string) => {
    const set = new Set<string>((c.completedDays || []) as string[]);
    if (set.has(day)) set.delete(day); else set.add(day);
    updateChallenge(c.id, { completedDays: Array.from(set) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Challenges</h1>
        <Button onClick={() => { setF({ name: '', description: '', habitId: '', duration: 30, startDate: todayStr() }); setOpen(true); }}><Plus size={16} /> New challenge</Button>
      </div>
      <div className="space-y-4">
        {challenges.map(c => {
          const start = parseISO(c.startDate);
          const days: string[] = [];
          for (let i = 0; i < c.duration; i++) {
            const d = new Date(start); d.setDate(d.getDate() + i);
            days.push(format(d, 'yyyy-MM-dd'));
          }
          const today = todayStr();
          const completedDays = c.completedDays || [];
          const doneCount = completedDays.length;
          const pct = Math.round((doneCount / c.duration) * 100);
          const habit = c.habitId ? habits.find(h => h.id === c.habitId) : null;
          return (
            <Card key={c.id} className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2"><Flame size={16} className="text-orange-500" /> {c.name}</div>
                  <div className="text-xs text-text-muted">{c.description}{habit ? ` · ${habit.name}` : ''}</div>
                </div>
                <button onClick={() => deleteChallenge(c.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${pct}%` }} /></div>
                <span className="text-xs text-text-muted">{doneCount}/{c.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {days.map(d => {
                  const done = completedDays.includes(d);
                  const isFuture = d > today;
                  const isToday = d === today;
                  return (
                    <button
                      key={d}
                      disabled={isFuture}
                      onClick={() => toggleDay(c, d)}
                      className={`h-7 w-7 rounded-md text-[10px] font-medium ${done ? 'bg-orange-500 text-white' : isToday ? 'bg-surface-2 ring-2 ring-accent' : isFuture ? 'bg-surface-2 opacity-40' : 'bg-surface-2'}`}
                      title={d}
                    >
                      {parseISO(d).getDate()}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
        {challenges.length === 0 && <Card className="p-8 text-center text-text-muted">No challenges yet. Start a 30-day challenge!</Card>}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="New challenge">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} rows={2} /></div>
          <div><Label>Linked habit (optional)</Label><Select value={f.habitId} onValueChange={v => setF({ ...f, habitId: v })} options={[{ value: '', label: 'None' }, ...habits.filter(h => !h.archived).map(h => ({ value: h.id, label: h.name }))]} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duration (days)</Label><Input type="number" value={f.duration} onChange={e => setF({ ...f, duration: Number(e.target.value) })} /></div>
            <div><Label>Start date</Label><Input type="date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.name.trim()) return; addChallenge({ ...f, id: uid(), completedDays: [], createdAt: new Date().toISOString() } as any); setOpen(false); }}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}