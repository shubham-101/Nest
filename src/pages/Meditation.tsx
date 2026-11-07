import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, Wind } from 'lucide-react';

export default function Meditation() {
  const sessions = useStore(s => s.meditationSessions);
  const add = useStore(s => s.addMeditation);
  const del = useStore(s => s.deleteMeditation);

  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [type, setType] = useState('mindfulness');

  const [open, setOpen] = useState(false);
  const [f, setF] = useState<any>({ duration: 10, type: 'mindfulness', note: '', date: todayStr() });
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const stop = () => {
    setRunning(false);
    if (seconds >= 30) {
      setF({ duration: Math.round(seconds / 60) || 1, type, note: '', date: todayStr() });
      setOpen(true);
    }
    setSeconds(0);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const totalMin = sessions.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl">Meditation</h1>

      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <div className="text-sm text-text-muted">{type}</div>
          <div className="font-mono text-6xl font-bold">{mm}:{ss}</div>
          <div className="flex justify-center gap-3">
            {!running ? (
              <Button size="lg" onClick={() => setRunning(true)}><Wind size={18} /> Start</Button>
            ) : (
              <Button size="lg" onClick={stop}>Stop & save</Button>
            )}
          </div>
          <Select value={type} onValueChange={setType} options={[
            { value: 'mindfulness', label: 'Mindfulness' }, { value: 'breathing', label: 'Breathing' },
            { value: 'body-scan', label: 'Body scan' }, { value: 'loving-kindness', label: 'Loving kindness' }, { value: 'other', label: 'Other' },
          ]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sessions · {sessions.length} · {totalMin} min total</CardTitle>
          <Button size="sm" variant="ghost" onClick={() => { setF({ duration: 10, type: 'mindfulness', note: '', date: todayStr() }); setOpen(true); }}><Plus size={14} /></Button>
        </CardHeader>
        <CardContent>
          {sessions.slice(0, 20).map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
              <span className="font-medium">{s.type}</span>
              <span className="text-text-muted">{s.duration} min</span>
              <span className="flex-1 text-text-muted truncate">{s.note}</span>
              <span className="text-xs text-text-muted">{s.date}</span>
              <button onClick={() => del(s.id)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
            </div>
          ))}
          {sessions.length === 0 && <div className="text-text-muted text-sm">No sessions yet.</div>}
        </CardContent>
      </Card>

      <Modal open={open} onOpenChange={setOpen} title="Log meditation">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duration (min)</Label><Input type="number" value={f.duration} onChange={e => setF({ ...f, duration: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div><Label>Type</Label><Select value={f.type} onValueChange={v => setF({ ...f, type: v })} options={[{ value: 'mindfulness', label: 'Mindfulness' }, { value: 'breathing', label: 'Breathing' }, { value: 'body-scan', label: 'Body scan' }, { value: 'loving-kindness', label: 'Loving kindness' }, { value: 'other', label: 'Other' }]} /></div>
          <div><Label>Note</Label><Textarea value={f.note} onChange={e => setF({ ...f, note: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { add({ ...f, id: uid(), createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}