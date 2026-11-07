import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

const COLORS = ['#0f766e', '#7c3aed', '#2563eb', '#d97706', '#16a34a', '#dc2626'];

export default function Planner() {
  const blocks = useStore(s => s.timeBlocks);
  const add = useStore(s => s.addTimeBlock);

  const del = useStore(s => s.deleteTimeBlock);

  const [date, setDate] = useState(todayStr());
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<any>({ title: '', start: '09:00', end: '10:00', color: COLORS[0], note: '' });

  const dayBlocks = blocks.filter(b => b.date === date).sort((a, b) => a.start.localeCompare(b.start));

  // 24h grid hours
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6am-10pm

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Planner</h1>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
          <Button onClick={() => { setF({ title: '', start: '09:00', end: '10:00', color: COLORS[0], note: '' }); setOpen(true); }}><Plus size={16} /> Block</Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="relative">
            {hours.map(h => (
              <div key={h} className="flex border-t border-border" style={{ height: 48 }}>
                <div className="w-12 text-xs text-text-muted pt-1">{String(h).padStart(2, '0')}:00</div>
                <div className="flex-1 relative">
                  {dayBlocks.filter(b => {
                    const sh = parseInt(b.start.split(':')[0]);
                    return sh === h;
                  }).map(b => {
                    const [sh, sm] = b.start.split(':').map(Number);
                    const [eh, em] = b.end.split(':').map(Number);
                    const top = (sm / 60) * 48;
                    const height = ((eh * 60 + em) - (sh * 60 + sm)) / 60 * 48;
                    return (
                      <div key={b.id} className="absolute left-1 right-1 rounded-lg px-2 py-1 text-xs text-white overflow-hidden" style={{ top, height: Math.max(20, height), background: b.color }}>
                        <div className="font-medium truncate">{b.title}</div>
                        <div className="opacity-80">{b.start}–{b.end}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {dayBlocks.map(b => (
          <Card key={b.id} className="p-3 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ background: b.color }} />
            <div className="flex-1">
              <div className="text-sm font-medium">{b.title}</div>
              <div className="text-xs text-text-muted">{b.start} – {b.end}{b.note ? ' · ' + b.note : ''}</div>
            </div>
            <button onClick={() => del(b.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
          </Card>
        ))}
        {dayBlocks.length === 0 && <Card className="p-8 text-center text-text-muted">No blocks for this day.</Card>}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Add time block">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start</Label><Input type="time" value={f.start} onChange={e => setF({ ...f, start: e.target.value })} /></div>
            <div><Label>End</Label><Input type="time" value={f.end} onChange={e => setF({ ...f, end: e.target.value })} /></div>
          </div>
          <div><Label>Color</Label><div className="flex gap-1.5">{COLORS.map(c => <button key={c} onClick={() => setF({ ...f, color: c })} className={`h-7 w-7 rounded-full ${f.color === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />)}</div></div>
          <div><Label>Note</Label><Input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.title.trim()) return; add({ ...f, id: uid(), date, createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}