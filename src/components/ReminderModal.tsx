import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';

export const ReminderModal = ({ open, onOpenChange, initialDate }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialDate?: string;
}) => {
  const add = useStore(s => s.addReminder);
  const habits = useStore(s => s.habits);
  const projects = useStore(s => s.projects);
  const [f, setF] = useState<any>({ title: '', date: initialDate || todayStr(), time: '09:00', repeat: 'none', daysOfWeek: [] as number[], linkedHabitId: '', linkedProjectId: '', note: '' });

  const openReset = (tabOpen: boolean) => {
    if (tabOpen) setF({ title: '', date: initialDate || todayStr(), time: new Date().toTimeString().slice(0, 5) || '09:00', repeat: 'none', daysOfWeek: [] as number[], linkedHabitId: '', linkedProjectId: '', note: '' });
  };

  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));

  const save = () => {
    if (!f.title.trim()) return;
    add({
      ...f,
      id: uid(),
      done: false,
      createdAt: new Date().toISOString(),
      linkedHabitId: f.linkedHabitId || undefined,
      linkedProjectId: f.linkedProjectId || undefined,
    } as any);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={(v) => { if (v) openReset(true); onOpenChange(v); }} title="New reminder">
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Call dentist" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Date</Label><Input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></div>
          <div><Label>Time</Label><Input type="time" value={f.time} onChange={e => set('time', e.target.value)} /></div>
        </div>
        <div>
          <Label>Repeat</Label>
          <Select value={f.repeat} onValueChange={v => set('repeat', v)} options={[
            { value: 'none', label: 'Once' },
            { value: 'daily', label: 'Every day' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]} />
        </div>
        {f.repeat === 'weekly' && (
          <div>
            <Label>Days of week</Label>
            <div className="flex gap-1.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <button key={d} onClick={() => {
                  const arr = f.daysOfWeek.includes(i) ? f.daysOfWeek.filter((x: number) => x !== i) : [...f.daysOfWeek, i];
                  set('daysOfWeek', arr);
                }} className={`flex-1 h-9 rounded-lg text-xs font-medium ${f.daysOfWeek.includes(i) ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>{d}</button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Link to habit (optional)</Label>
            <Select value={f.linkedHabitId} onValueChange={v => set('linkedHabitId', v)} options={[{ value: '', label: 'None' }, ...habits.filter(h => !h.archived).map(h => ({ value: h.id, label: h.name }))]} />
          </div>
          <div>
            <Label>Link to project (optional)</Label>
            <Select value={f.linkedProjectId} onValueChange={v => set('linkedProjectId', v)} options={[{ value: '', label: 'None' }, ...projects.map(p => ({ value: p.id, label: p.name }))]} />
          </div>
        </div>
        <div>
          <Label>Note (optional)</Label>
          <Textarea value={f.note} onChange={e => set('note', e.target.value)} rows={2} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save reminder</Button>
        </div>
      </div>
    </Modal>
  );
};