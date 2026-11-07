import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, Target } from 'lucide-react';

export default function Goals() {
  const goals = useStore(s => s.goals);
  const habits = useStore(s => s.habits);
  const addGoal = useStore(s => s.addGoal);
  const updateGoal = useStore(s => s.updateGoal);
  const deleteGoal = useStore(s => s.deleteGoal);

  const [open, setOpen] = useState(false);
  const [f, setF] = useState<any>({ title: '', description: '', habitId: '', target: 10, current: 0, unit: 'times', deadline: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Goals</h1>
        <Button onClick={() => { setF({ title: '', description: '', habitId: '', target: 10, current: 0, unit: 'times', deadline: '' }); setOpen(true); }}><Plus size={16} /> New goal</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map(g => {
          const pct = g.target ? Math.round((g.current / g.target) * 100) : 0;
          const habit = g.habitId ? habits.find(h => h.id === g.habitId) : null;
          return (
            <Card key={g.id} className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Target size={18} className="text-accent mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{g.title}</div>
                  {g.description && <div className="text-xs text-text-muted">{g.description}</div>}
                  {habit && <div className="text-xs text-text-muted">Linked: {habit.name}</div>}
                </div>
                <button onClick={() => deleteGoal(g.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>{g.current} / {g.target} {g.unit}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${Math.min(100, pct)}%` }} /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => updateGoal(g.id, { current: Math.max(0, g.current - 1) })}>-</Button>
                <Button size="sm" onClick={() => updateGoal(g.id, { current: g.current + 1 })}>+1</Button>
                <Button size="sm" variant="ghost" onClick={() => updateGoal(g.id, { completed: !g.completed })}>{g.completed ? 'Undo' : 'Complete'}</Button>
              </div>
              {g.deadline && <div className="text-xs text-text-muted">Due {g.deadline}</div>}
            </Card>
          );
        })}
        {goals.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No goals yet. Set one to track progress.</Card>}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="New goal">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Description</Label><Input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
          <div><Label>Linked habit (optional)</Label><Select value={f.habitId} onValueChange={v => setF({ ...f, habitId: v })} options={[{ value: '', label: 'None' }, ...habits.filter(h => !h.archived).map(h => ({ value: h.id, label: h.name }))]} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Target</Label><Input type="number" value={f.target} onChange={e => setF({ ...f, target: Number(e.target.value) })} /></div>
            <div><Label>Current</Label><Input type="number" value={f.current} onChange={e => setF({ ...f, current: Number(e.target.value) })} /></div>
            <div><Label>Unit</Label><Input value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })} /></div>
          </div>
          <div><Label>Deadline</Label><Input type="date" value={f.deadline} onChange={e => setF({ ...f, deadline: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.title.trim()) return; addGoal({ ...f, id: uid(), createdAt: new Date().toISOString(), completed: false } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}