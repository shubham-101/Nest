import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

const TRIGGERS = ['Stress', 'Boredom', 'Social', 'Habit/cue', 'Emotion', 'Tiredness', 'Celebration', 'Other'];
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

export default function Quit() {
  const badHabits = useStore(s => s.badHabits);
  const urgeLogs = useStore(s => s.urgeLogs);
  const habits = useStore(s => s.habits);
  const addBadHabit = useStore(s => s.addBadHabit);

  const deleteBadHabit = useStore(s => s.deleteBadHabit);
  const addUrgeLog = useStore(s => s.addUrgeLog);
  const deleteUrgeLog = useStore(s => s.deleteUrgeLog);

  const [open, setOpen] = useState(false);
  const [urgeOpen, setUrgeOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [f, setF] = useState<any>({ name: '', icon: '🚭', color: '#dc2626', reason: '', triggers: [] as string[], replacementHabitId: '', costPerOccurrence: 0, currency: '₹', targetDays: 30, startDate: todayStr() });
  const [uf, setUf] = useState<any>({ badHabitId: '', intensity: 3, trigger: '', note: '', resisted: true, date: todayStr() });

  const daysClean = (bh: any) => {
    const relapses = urgeLogs.filter(u => u.badHabitId === bh.id && !u.resisted).map(u => u.date).sort();
    const lastRelapse = relapses.length ? relapses[relapses.length - 1] : null;
    const start = lastRelapse && lastRelapse > bh.startDate ? lastRelapse : bh.startDate;
    const diff = Math.floor((new Date(todayStr()).getTime() - new Date(start).getTime()) / 86400000);
    return Math.max(0, diff);
  };
  const longestClean = (bh: any) => {
    const relapses = urgeLogs.filter(u => u.badHabitId === bh.id && !u.resisted).map(u => u.date).sort();
    const dates = [bh.startDate, ...relapses, todayStr()];
    let best = 0;
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.floor((new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000);
      if (diff > best) best = diff;
    }
    return best;
  };
  const moneySaved = (bh: any) => {
    const clean = daysClean(bh);
    // assume avoided 1 occurrence per day
    return (clean * (bh.costPerOccurrence || 0)).toFixed(0);
  };

  const sel = badHabits.find(b => b.id === selected);
  const selLogs = urgeLogs.filter(u => u.badHabitId === selected).sort((a, b) => b.date.localeCompare(a.date));

  // trigger analysis
  const triggerCounts: Record<string, number> = {};
  urgeLogs.filter(u => u.badHabitId === selected).forEach(u => {
    if (u.trigger) triggerCounts[u.trigger] = (triggerCounts[u.trigger] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Quit bad habits</h1>
        <Button onClick={() => { setF({ name: '', icon: '🚭', color: '#dc2626', reason: '', triggers: [], replacementHabitId: '', costPerOccurrence: 0, currency: '₹', targetDays: 30, startDate: todayStr() }); setOpen(true); }}><Plus size={16} /> New</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badHabits.map(bh => {
          const clean = daysClean(bh);
          const pct = Math.min(100, Math.round((clean / bh.targetDays) * 100));
          const longest = longestClean(bh);
          return (
            <Card key={bh.id} className={`p-4 space-y-3 cursor-pointer ${selected === bh.id ? 'ring-2 ring-accent' : ''}`} onClick={() => setSelected(bh.id === selected ? null : bh.id)}>
              <div className="flex items-start gap-2">
                <div className="text-2xl">{bh.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{bh.name}</div>
                  {bh.reason && <div className="text-xs text-text-muted line-clamp-1">{bh.reason}</div>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteBadHabit(bh.id); if (selected === bh.id) setSelected(null); }} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent">{clean}</div>
                <div className="text-xs text-text-muted">days clean</div>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>Longest: {longest}d</span>
                <span>Target: {bh.targetDays}d</span>
                {bh.costPerOccurrence > 0 && <span>Saved: {bh.currency}{moneySaved(bh)}</span>}
              </div>
              {/* milestones */}
              <div className="flex flex-wrap gap-1">
                {MILESTONES.filter(m => m <= bh.targetDays).map(m => (
                  <span key={m} className={`text-[10px] px-1.5 py-0.5 rounded ${clean >= m ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-text-muted'}`}>{m}d</span>
                ))}
              </div>
            </Card>
          );
        })}
        {badHabits.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No bad habits tracked. Add one to start quitting.</Card>}
      </div>

      {sel && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{sel.icon} {sel.name}</CardTitle>
            <Button size="sm" onClick={() => { setUf({ badHabitId: sel.id, intensity: 3, trigger: '', note: '', resisted: true, date: todayStr() }); setUrgeOpen(true); }}><Plus size={14} /> Log urge</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {sel.reason && <div className="text-sm"><span className="font-medium">Why quit:</span> {sel.reason}</div>}
            {sel.triggers.length > 0 && <div className="text-sm"><span className="font-medium">Triggers:</span> {sel.triggers.join(', ')}</div>}
            {sel.replacementHabitId && <div className="text-sm"><span className="font-medium">Replacement:</span> {habits.find(h => h.id === sel.replacementHabitId)?.name}</div>}

            {Object.keys(triggerCounts).length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Urge triggers</div>
                {Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => (
                  <div key={t} className="flex items-center gap-3 py-1">
                    <span className="flex-1 text-sm">{t}</span>
                    <div className="w-32 h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${(c / selLogs.length) * 100}%` }} /></div>
                    <span className="text-xs text-text-muted">{c}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="text-sm font-medium mb-2">Urge log</div>
              <div className="space-y-2">
                {selLogs.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.resisted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{u.resisted ? 'Resisted' : 'Relapsed'}</span>
                    <span className="text-text-muted">{u.date}</span>
                    <span className="text-xs">Intensity {u.intensity}/5</span>
                    {u.trigger && <span className="text-xs bg-surface-2 px-2 py-0.5 rounded-full">{u.trigger}</span>}
                    {u.note && <span className="flex-1 text-text-muted truncate">{u.note}</span>}
                    <button onClick={() => deleteUrgeLog(u.id)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                  </div>
                ))}
                {selLogs.length === 0 && <div className="text-text-muted text-sm">No urges logged yet.</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={open} onOpenChange={setOpen} title="New bad habit to quit">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Smoking" /></div>
            <div><Label>Icon</Label><Input value={f.icon} onChange={e => setF({ ...f, icon: e.target.value })} /></div>
          </div>
          <div><Label>Why quit (your reason)</Label><Textarea value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} rows={2} /></div>
          <div><Label>Triggers (comma separated)</Label><Input value={(f.triggers || []).join(', ')} onChange={e => setF({ ...f, triggers: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) })} /></div>
          <div><Label>Replacement habit (optional)</Label><Select value={f.replacementHabitId} onValueChange={v => setF({ ...f, replacementHabitId: v })} options={[{ value: '', label: 'None' }, ...habits.filter(h => !h.archived).map(h => ({ value: h.id, label: h.name }))]} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Cost per occurrence</Label><Input type="number" value={f.costPerOccurrence} onChange={e => setF({ ...f, costPerOccurrence: Number(e.target.value) })} /></div>
            <div><Label>Currency</Label><Input value={f.currency} onChange={e => setF({ ...f, currency: e.target.value })} /></div>
            <div><Label>Target days</Label><Input type="number" value={f.targetDays} onChange={e => setF({ ...f, targetDays: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Start date</Label><Input type="date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.name.trim()) return; addBadHabit({ ...f, id: uid(), archived: false, createdAt: new Date().toISOString() } as any); setOpen(false); }}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={urgeOpen} onOpenChange={setUrgeOpen} title="Log urge">
        <div className="space-y-4">
          <div><Label>Bad habit</Label><Select value={uf.badHabitId} onValueChange={v => setUf({ ...uf, badHabitId: v })} options={badHabits.map(b => ({ value: b.id, label: b.name }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={uf.date} onChange={e => setUf({ ...uf, date: e.target.value })} /></div>
            <div><Label>Intensity (1-5)</Label><Select value={String(uf.intensity)} onValueChange={v => setUf({ ...uf, intensity: Number(v) })} options={[1, 2, 3, 4, 5].map(n => ({ value: String(n), label: String(n) }))} /></div>
          </div>
          <div><Label>Trigger</Label><Select value={uf.trigger} onValueChange={v => setUf({ ...uf, trigger: v })} options={[{ value: '', label: 'None' }, ...TRIGGERS.map(t => ({ value: t, label: t }))]} /></div>
          <div><Label>Note</Label><Textarea value={uf.note} onChange={e => setUf({ ...uf, note: e.target.value })} rows={2} /></div>
          <div className="flex gap-2">
            <Button variant={uf.resisted ? 'primary' : 'outline'} onClick={() => setUf({ ...uf, resisted: true })}>Resisted ✓</Button>
            <Button variant={!uf.resisted ? 'danger' : 'outline'} onClick={() => setUf({ ...uf, resisted: false })}>Relapsed ✗</Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setUrgeOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!uf.badHabitId) return; addUrgeLog({ ...uf, id: uid(), createdAt: new Date().toISOString() } as any); setUrgeOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}