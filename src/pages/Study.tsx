import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

const COLORS = ['#0f766e','#7c3aed','#2563eb','#d97706','#16a34a','#dc2626','#db2777'];

export default function Study() {
  const topics = useStore(s => s.studyTopics);
  const sessions = useStore(s => s.studySessions);
  const resources = useStore(s => s.studyResources);
  const addTopic = useStore(s => s.addStudyTopic);

  const deleteTopic = useStore(s => s.deleteStudyTopic);
  const addSession = useStore(s => s.addStudySession);
  const deleteSession = useStore(s => s.deleteStudySession);
  const addResource = useStore(s => s.addStudyResource);
  const updateResource = useStore(s => s.updateStudyResource);
  const deleteResource = useStore(s => s.deleteStudyResource);

  const [tab, setTab] = useState<'topics' | 'sessions' | 'resources'>('topics');
  const [topicOpen, setTopicOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [tf, setTf] = useState<any>({ name: '', subject: '', color: COLORS[0], icon: '📘' });
  const [sf, setSf] = useState<any>({ topicId: '', duration: 25, notes: '', date: todayStr() });
  const [rf, setRf] = useState<any>({ topicId: '', title: '', url: '', type: 'article', status: 'todo', progress: 0, notes: '' });

  const topicMap = new Map(topics.map(t => [t.id, t]));
  const totalMin = sessions.reduce((a, s) => a + s.duration, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Study tracker</h1>
        <div className="text-sm text-text-muted">{sessions.length} sessions · {totalMin} min total</div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['topics', 'sessions', 'resources'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${tab === t ? 'border-accent text-accent' : 'border-transparent text-text-muted'}`}>{t}</button>
        ))}
      </div>

      {tab === 'topics' && (
        <>
          <div className="flex justify-end"><Button onClick={() => { setTf({ name: '', subject: '', color: COLORS[0], icon: '📘' }); setTopicOpen(true); }}><Plus size={16} /> New topic</Button></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map(t => (
              <Card key={t.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ background: t.color + '22', color: t.color }}>{t.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-text-muted">{t.subject}</div>
                  </div>
                  <button onClick={() => deleteTopic(t.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
                </div>
                <div className="mt-3 text-xs text-text-muted">
                  {sessions.filter(s => s.topicId === t.id).length} sessions · {sessions.filter(s => s.topicId === t.id).reduce((a, s) => a + s.duration, 0)} min
                </div>
              </Card>
            ))}
            {topics.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No topics yet. Add one to start tracking study.</Card>}
          </div>
        </>
      )}

      {tab === 'sessions' && (
        <>
          <div className="flex justify-end"><Button onClick={() => { setSf({ topicId: topics[0]?.id || '', duration: 25, notes: '', date: todayStr() }); setSessionOpen(true); }}><Plus size={16} /> Log session</Button></div>
          <div className="space-y-2">
            {sessions.map(s => {
              const t = s.topicId ? topicMap.get(s.topicId) : null;
              return (
                <Card key={s.id} className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: (t?.color || '#888') + '22', color: t?.color || '#888' }}>{t?.icon || '📘'}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t?.name || 'General'} · {s.duration} min</div>
                    <div className="text-xs text-text-muted">{s.date}{s.notes ? ' · ' + s.notes : ''}</div>
                  </div>
                  <button onClick={() => deleteSession(s.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
                </Card>
              );
            })}
            {sessions.length === 0 && <Card className="p-8 text-center text-text-muted">No sessions logged yet.</Card>}
          </div>
        </>
      )}

      {tab === 'resources' && (
        <>
          <div className="flex justify-end"><Button onClick={() => { setRf({ topicId: topics[0]?.id || '', title: '', url: '', type: 'article', status: 'todo', progress: 0, notes: '' }); setResourceOpen(true); }}><Plus size={16} /> Add resource</Button></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {resources.map(r => {
              const t = r.topicId ? topicMap.get(r.topicId) : null;
              return (
                <Card key={r.id} className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.title}</div>
                      <div className="text-xs text-text-muted">{t?.name || 'General'} · {r.type}</div>
                    </div>
                    <button onClick={() => deleteResource(r.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1"><LinkIcon size={12} /> Open</a>}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${r.progress}%` }} />
                    </div>
                    <span className="text-xs text-text-muted">{r.progress}%</span>
                  </div>
                  <Select value={r.status} onValueChange={v => updateResource(r.id, { status: v as any })} options={[
                    { value: 'todo', label: 'To do' }, { value: 'in-progress', label: 'In progress' }, { value: 'done', label: 'Done' },
                  ]} />
                </Card>
              );
            })}
            {resources.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No resources yet.</Card>}
          </div>
        </>
      )}

      <Modal open={topicOpen} onOpenChange={setTopicOpen} title="New study topic">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={tf.name} onChange={e => setTf({ ...tf, name: e.target.value })} /></div>
          <div><Label>Subject</Label><Input value={tf.subject} onChange={e => setTf({ ...tf, subject: e.target.value })} /></div>
          <div><Label>Color</Label><div className="flex gap-1.5">{COLORS.map(c => <button key={c} onClick={() => setTf({ ...tf, color: c })} className={`h-7 w-7 rounded-full ${tf.color === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />)}</div></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTopicOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!tf.name.trim()) return; addTopic({ ...tf, id: uid(), createdAt: new Date().toISOString() } as any); setTopicOpen(false); }}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={sessionOpen} onOpenChange={setSessionOpen} title="Log study session">
        <div className="space-y-4">
          <div><Label>Topic</Label><Select value={sf.topicId} onValueChange={v => setSf({ ...sf, topicId: v })} options={topics.map(t => ({ value: t.id, label: t.name }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Duration (min)</Label><Input type="number" value={sf.duration} onChange={e => setSf({ ...sf, duration: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={sf.date} onChange={e => setSf({ ...sf, date: e.target.value })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={sf.notes} onChange={e => setSf({ ...sf, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSessionOpen(false)}>Cancel</Button>
            <Button onClick={() => { addSession({ ...sf, id: uid(), createdAt: new Date().toISOString() } as any); setSessionOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={resourceOpen} onOpenChange={setResourceOpen} title="Add resource">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={rf.title} onChange={e => setRf({ ...rf, title: e.target.value })} /></div>
          <div><Label>Topic</Label><Select value={rf.topicId} onValueChange={v => setRf({ ...rf, topicId: v })} options={topics.map(t => ({ value: t.id, label: t.name }))} /></div>
          <div><Label>URL</Label><Input value={rf.url} onChange={e => setRf({ ...rf, url: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label><Select value={rf.type} onValueChange={v => setRf({ ...rf, type: v })} options={[{ value: 'book', label: 'Book' }, { value: 'article', label: 'Article' }, { value: 'video', label: 'Video' }, { value: 'course', label: 'Course' }, { value: 'other', label: 'Other' }]} /></div>
            <div><Label>Progress %</Label><Input type="number" value={rf.progress} onChange={e => setRf({ ...rf, progress: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Notes</Label><Textarea value={rf.notes} onChange={e => setRf({ ...rf, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResourceOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!rf.title.trim()) return; addResource({ ...rf, id: uid(), createdAt: new Date().toISOString() } as any); setResourceOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}