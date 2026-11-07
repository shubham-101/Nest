import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Plus, Trash2, Pin } from 'lucide-react';

export default function Journal() {
  const gratitudes = useStore(s => s.gratitudes);
  const notes = useStore(s => s.notes);
  const addGratitude = useStore(s => s.addGratitude);
  const deleteGratitude = useStore(s => s.deleteGratitude);
  const addNote = useStore(s => s.addNote);
  const updateNote = useStore(s => s.updateNote);
  const deleteNote = useStore(s => s.deleteNote);

  const [tab, setTab] = useState<'gratitude' | 'notes'>('gratitude');
  const [gOpen, setGOpen] = useState(false);
  const [nOpen, setNOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [gItems, setGItems] = useState(['', '', '']);
  const [gNote, setGNote] = useState('');
  const [nf, setNf] = useState<any>({ title: '', content: '', tags: '', pinned: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Journal</h1>
        <Button onClick={() => {
          if (tab === 'gratitude') { setGItems(['', '', '']); setGNote(''); setGOpen(true); }
          else { setEditingNote(null); setNf({ title: '', content: '', tags: '', pinned: false }); setNOpen(true); }
        }}><Plus size={16} /> {tab === 'gratitude' ? 'Gratitude entry' : 'New note'}</Button>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['gratitude', 'notes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${tab === t ? 'border-accent text-accent' : 'border-transparent text-text-muted'}`}>{t}</button>
        ))}
      </div>

      {tab === 'gratitude' && (
        <div className="space-y-3">
          {gratitudes.map(g => (
            <Card key={g.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{g.date}</span>
                <button onClick={() => deleteGratitude(g.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {(g.items || []).filter(Boolean).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
              {g.note && <div className="text-xs text-text-muted mt-2 italic">{g.note}</div>}
            </Card>
          ))}
          {gratitudes.length === 0 && <Card className="p-8 text-center text-text-muted">No gratitude entries yet. Start a daily practice.</Card>}
        </div>
      )}

      {tab === 'notes' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {notes.map(n => (
            <Card key={n.id} className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <button onClick={() => updateNote(n.id, { pinned: !n.pinned })} className={n.pinned ? 'text-accent' : 'text-text-muted'}><Pin size={14} /></button>
                <div className="flex-1">
                  <div className="font-medium">{n.title || 'Untitled'}</div>
                  <div className="text-xs text-text-muted">{new Date(n.updatedAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => { setEditingNote(n); setNf({ title: n.title, content: n.content, tags: (n.tags || []).join(', '), pinned: n.pinned }); setNOpen(true); }} className="text-text-muted hover:text-text text-xs">Edit</button>
                <button onClick={() => deleteNote(n.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <div className="text-sm text-text-muted line-clamp-4 whitespace-pre-wrap">{n.content}</div>
              {(n.tags || []).length > 0 && <div className="flex flex-wrap gap-1">{(n.tags || []).map(t => <span key={t} className="text-xs bg-surface-2 px-2 py-0.5 rounded-full">{t}</span>)}</div>}
            </Card>
          ))}
          {notes.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No notes yet. Capture your ideas.</Card>}
        </div>
      )}

      <Modal open={gOpen} onOpenChange={setGOpen} title="Gratitude entry">
        <div className="space-y-4">
          {gItems.map((it, i) => (
            <div key={i}>
              <Label>Thing {i + 1}</Label>
              <Input value={it} onChange={e => { const next = [...gItems]; next[i] = e.target.value; setGItems(next); }} />
            </div>
          ))}
          <div><Label>Note (optional)</Label><Textarea value={gNote} onChange={e => setGNote(e.target.value)} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setGOpen(false)}>Cancel</Button>
            <Button onClick={() => { addGratitude({ id: uid(), date: todayStr(), items: gItems, note: gNote, createdAt: new Date().toISOString() } as any); setGOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={nOpen} onOpenChange={setNOpen} title={editingNote ? 'Edit note' : 'New note'}>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={nf.title} onChange={e => setNf({ ...nf, title: e.target.value })} /></div>
          <div><Label>Content</Label><Textarea value={nf.content} onChange={e => setNf({ ...nf, content: e.target.value })} rows={6} /></div>
          <div><Label>Tags</Label><Input value={nf.tags} onChange={e => setNf({ ...nf, tags: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nf.pinned} onChange={e => setNf({ ...nf, pinned: e.target.checked })} /> Pinned</label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const tags = nf.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
              if (editingNote) updateNote(editingNote.id, { title: nf.title, content: nf.content, tags, pinned: nf.pinned });
              else addNote({ id: uid(), title: nf.title, content: nf.content, tags, pinned: nf.pinned, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any);
              setNOpen(false);
            }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}