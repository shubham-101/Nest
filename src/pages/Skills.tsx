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

export default function Skills() {
  const skills = useStore(s => s.skills);
  const practices = useStore(s => s.skillPractices);
  const addSkill = useStore(s => s.addSkill);
  const updateSkill = useStore(s => s.updateSkill);
  const deleteSkill = useStore(s => s.deleteSkill);
  const addPractice = useStore(s => s.addSkillPractice);
  const deletePractice = useStore(s => s.deleteSkillPractice);

  const [open, setOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [f, setF] = useState<any>({ name: '', category: 'Design', level: 0, target: 100, notes: '' });
  const [pf, setPf] = useState<any>({ skillId: '', duration: 30, note: '', date: todayStr() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Skills</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setPf({ skillId: skills[0]?.id || '', duration: 30, note: '', date: todayStr() }); setPracticeOpen(true); }}>Log practice</Button>
          <Button onClick={() => { setF({ name: '', category: 'Design', level: 0, target: 100, notes: '' }); setOpen(true); }}><Plus size={16} /> Add skill</Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {skills.map(sk => {
          const skPractices = practices.filter(p => p.skillId === sk.id);
          const totalMin = skPractices.reduce((a, p) => a + p.duration, 0);
          return (
            <Card key={sk.id} className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-medium">{sk.name}</div>
                  <div className="text-xs text-text-muted">{sk.category}</div>
                </div>
                <button onClick={() => deleteSkill(sk.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Level {sk.level}%</span><span>target {sk.target}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${sk.level}%` }} /></div>
                <input type="range" min={0} max={100} value={sk.level} onChange={e => updateSkill(sk.id, { level: Number(e.target.value) })} className="w-full mt-2" />
              </div>
              <div className="text-xs text-text-muted">{skPractices.length} practice sessions · {totalMin} min</div>
              {sk.notes && <div className="text-xs text-text-muted line-clamp-2">{sk.notes}</div>}
            </Card>
          );
        })}
        {skills.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No skills yet. Add one to track your growth.</Card>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent practice</CardTitle></CardHeader>
        <CardContent>
          {practices.slice(0, 10).map(p => {
            const sk = skills.find(s => s.id === p.skillId);
            return (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                <span className="font-medium">{sk?.name || '—'}</span>
                <span className="text-text-muted">{p.duration} min</span>
                <span className="flex-1 text-text-muted truncate">{p.note}</span>
                <span className="text-xs text-text-muted">{p.date}</span>
                <button onClick={() => deletePractice(p.id)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
              </div>
            );
          })}
          {practices.length === 0 && <div className="text-text-muted text-sm">No practice logged.</div>}
        </CardContent>
      </Card>

      <Modal open={open} onOpenChange={setOpen} title="Add skill">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Current level %</Label><Input type="number" value={f.level} onChange={e => setF({ ...f, level: Number(e.target.value) })} /></div>
            <div><Label>Target %</Label><Input type="number" value={f.target} onChange={e => setF({ ...f, target: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.name.trim()) return; addSkill({ ...f, id: uid(), createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={practiceOpen} onOpenChange={setPracticeOpen} title="Log practice">
        <div className="space-y-4">
          <div><Label>Skill</Label><Select value={pf.skillId} onValueChange={v => setPf({ ...pf, skillId: v })} options={skills.map(s => ({ value: s.id, label: s.name }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duration (min)</Label><Input type="number" value={pf.duration} onChange={e => setPf({ ...pf, duration: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={pf.date} onChange={e => setPf({ ...pf, date: e.target.value })} /></div>
          </div>
          <div><Label>Note</Label><Textarea value={pf.note} onChange={e => setPf({ ...pf, note: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPracticeOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!pf.skillId) return; addPractice({ ...pf, id: uid(), createdAt: new Date().toISOString() } as any); setPracticeOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}