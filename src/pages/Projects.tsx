import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function Projects() {
  const projects = useStore(s => s.projects);
  const milestones = useStore(s => s.milestones);
  const tasks = useStore(s => s.projectTasks);
  const addProject = useStore(s => s.addProject);
  const updateProject = useStore(s => s.updateProject);
  const deleteProject = useStore(s => s.deleteProject);
  const addMilestone = useStore(s => s.addMilestone);
  const updateMilestone = useStore(s => s.updateMilestone);
  const deleteMilestone = useStore(s => s.deleteMilestone);
  const addTask = useStore(s => s.addProjectTask);
  const updateTask = useStore(s => s.updateProjectTask);
  const deleteTask = useStore(s => s.deleteProjectTask);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [f, setF] = useState<any>({ name: '', description: '', status: 'idea', progress: 0, color: '#0f766e', deadline: '', tags: '' });
  const [mf, setMf] = useState<any>({ title: '', dueDate: '' });
  const [tf, setTf] = useState<any>({ title: '', priority: 'med' });
  const [msOpen, setMsOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const sel = projects.find(p => p.id === selected);
  const selMilestones = milestones.filter(m => m.projectId === selected);
  const selTasks = tasks.filter(t => t.projectId === selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Projects</h1>
        <Button onClick={() => { setF({ name: '', description: '', status: 'idea', progress: 0, color: '#0f766e', deadline: '', tags: '' }); setOpen(true); }}><Plus size={16} /> New project</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => {
          const pTasks = tasks.filter(t => t.projectId === p.id);
          const doneTasks = pTasks.filter(t => t.done).length;
          return (
            <Card key={p.id} className={`p-4 space-y-2 cursor-pointer ${selected === p.id ? 'ring-2 ring-accent' : ''}`} onClick={() => setSelected(p.id === selected ? null : p.id)}>
              <div className="flex items-start gap-2">
                <div className="h-3 w-3 rounded-full mt-1.5" style={{ background: p.color }} />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-text-muted">{p.status}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); if (selected === p.id) setSelected(null); }} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full" style={{ width: `${p.progress}%`, background: p.color }} /></div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>{p.progress}%</span>
                <span>{doneTasks}/{pTasks.length} tasks</span>
              </div>
              {p.deadline && <div className="text-xs text-text-muted">Due {p.deadline}</div>}
            </Card>
          );
        })}
        {projects.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No projects yet.</Card>}
      </div>

      {sel && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{sel.name}</CardTitle>
            <Select value={sel.status} onValueChange={v => updateProject(sel.id, { status: v as any })} options={[
              { value: 'idea', label: 'Idea' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'done', label: 'Done' },
            ]} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-text mb-1.5 block">Progress</Label>
              <input type="range" min={0} max={100} value={sel.progress} onChange={e => updateProject(sel.id, { progress: Number(e.target.value) })} className="w-full" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Milestones</h3>
                <Button size="sm" variant="ghost" onClick={() => { setMf({ title: '', dueDate: '' }); setMsOpen(true); }}><Plus size={14} /></Button>
              </div>
              {selMilestones.map(m => (
                <div key={m.id} className="flex items-center gap-2 py-1.5">
                  <button onClick={() => updateMilestone(m.id, { done: !m.done })}>
                    {m.done ? <CheckCircle2 size={16} className="text-accent" /> : <Circle size={16} className="text-text-muted" />}
                  </button>
                  <span className={`flex-1 text-sm ${m.done ? 'line-through text-text-muted' : ''}`}>{m.title}</span>
                  {m.dueDate && <span className="text-xs text-text-muted">{m.dueDate}</span>}
                  <button onClick={() => deleteMilestone(m.id)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Tasks</h3>
                <Button size="sm" variant="ghost" onClick={() => { setTf({ title: '', priority: 'med' }); setTaskOpen(true); }}><Plus size={14} /></Button>
              </div>
              {selTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1.5">
                  <button onClick={() => updateTask(t.id, { done: !t.done })}>
                    {t.done ? <CheckCircle2 size={16} className="text-accent" /> : <Circle size={16} className="text-text-muted" />}
                  </button>
                  <span className={`flex-1 text-sm ${t.done ? 'line-through text-text-muted' : ''}`}>{t.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${t.priority === 'high' ? 'bg-red-100 text-red-600' : t.priority === 'med' ? 'bg-amber-100 text-amber-600' : 'bg-surface-2 text-text-muted'}`}>{t.priority}</span>
                  <button onClick={() => deleteTask(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal open={open} onOpenChange={setOpen} title="New project">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Status</Label><Select value={f.status} onValueChange={v => setF({ ...f, status: v })} options={[{ value: 'idea', label: 'Idea' }, { value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'done', label: 'Done' }]} /></div>
            <div><Label>Deadline</Label><Input type="date" value={f.deadline} onChange={e => setF({ ...f, deadline: e.target.value })} /></div>
          </div>
          <div><Label>Color</Label><div className="flex gap-1.5">{['#0f766e','#7c3aed','#2563eb','#d97706','#16a34a','#dc2626'].map(c => <button key={c} onClick={() => setF({ ...f, color: c })} className={`h-7 w-7 rounded-full ${f.color === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />)}</div></div>
          <div><Label>Tags</Label><Input value={f.tags} onChange={e => setF({ ...f, tags: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.name.trim()) return; addProject({ ...f, id: uid(), tags: f.tags.split(',').map((t: string) => t.trim()).filter(Boolean), createdAt: new Date().toISOString() } as any); setOpen(false); }}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={msOpen} onOpenChange={setMsOpen} title="Add milestone">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={mf.title} onChange={e => setMf({ ...mf, title: e.target.value })} /></div>
          <div><Label>Due date</Label><Input type="date" value={mf.dueDate} onChange={e => setMf({ ...mf, dueDate: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setMsOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!mf.title.trim() || !selected) return; addMilestone({ ...mf, id: uid(), projectId: selected, done: false, createdAt: new Date().toISOString() } as any); setMsOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={taskOpen} onOpenChange={setTaskOpen} title="Add task">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={tf.title} onChange={e => setTf({ ...tf, title: e.target.value })} /></div>
          <div><Label>Priority</Label><Select value={tf.priority} onValueChange={v => setTf({ ...tf, priority: v })} options={[{ value: 'low', label: 'Low' }, { value: 'med', label: 'Medium' }, { value: 'high', label: 'High' }]} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTaskOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!tf.title.trim() || !selected) return; addTask({ ...tf, id: uid(), projectId: selected, done: false, createdAt: new Date().toISOString() } as any); setTaskOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}