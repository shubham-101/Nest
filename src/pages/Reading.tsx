import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = { want: 'Want to read', reading: 'Reading', done: 'Finished' };

export default function Reading() {
  const books = useStore(s => s.books);
  const addBook = useStore(s => s.addBook);
  const updateBook = useStore(s => s.updateBook);
  const deleteBook = useStore(s => s.deleteBook);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [f, setF] = useState<any>({ title: '', author: '', status: 'want', currentPage: 0, totalPages: 0, rating: 0, notes: '', tags: '' });

  const filtered = filter === 'all' ? books : books.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Reading list</h1>
        <Button onClick={() => { setF({ title: '', author: '', status: 'want', currentPage: 0, totalPages: 0, rating: 0, notes: '', tags: '' }); setOpen(true); }}><Plus size={16} /> Add book</Button>
      </div>
      <div className="flex gap-2">
        <Select value={filter} onValueChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'want', label: 'Want to read' }, { value: 'reading', label: 'Reading' }, { value: 'done', label: 'Finished' }]} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => {
          const pct = b.totalPages ? Math.round((b.currentPage / b.totalPages) * 100) : 0;
          return (
            <Card key={b.id} className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-text-muted">{b.author}</div>
                </div>
                <button onClick={() => deleteBook(b.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
              <span className="text-xs bg-surface-2 px-2 py-0.5 rounded-full">{STATUS_LABELS[b.status]}</span>
              {b.status === 'reading' && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs text-text-muted">{b.currentPage}/{b.totalPages}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input type="number" placeholder="page" className="h-8" onChange={e => updateBook(b.id, { currentPage: Number(e.target.value) })} />
                  </div>
                </div>
              )}
              {b.status === 'done' && b.rating > 0 && (
                <div className="text-xs text-amber-500">{'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)}</div>
              )}
              {b.notes && <div className="text-xs text-text-muted line-clamp-2">{b.notes}</div>}
              <Select value={b.status} onValueChange={v => updateBook(b.id, { status: v as any, ...(v === 'reading' && !b.startedAt ? { startedAt: new Date().toISOString() } : {}), ...(v === 'done' ? { finishedAt: new Date().toISOString() } : {}) })} options={[
                { value: 'want', label: 'Want to read' }, { value: 'reading', label: 'Reading' }, { value: 'done', label: 'Finished' },
              ]} />
            </Card>
          );
        })}
        {filtered.length === 0 && <Card className="p-8 text-center text-text-muted col-span-full">No books yet.</Card>}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Add book">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Author</Label><Input value={f.author} onChange={e => setF({ ...f, author: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Total pages</Label><Input type="number" value={f.totalPages} onChange={e => setF({ ...f, totalPages: Number(e.target.value) })} /></div>
            <div><Label>Status</Label><Select value={f.status} onValueChange={v => setF({ ...f, status: v })} options={[{ value: 'want', label: 'Want to read' }, { value: 'reading', label: 'Reading' }, { value: 'done', label: 'Finished' }]} /></div>
          </div>
          <div><Label>Tags</Label><Input value={f.tags} onChange={e => setF({ ...f, tags: e.target.value })} placeholder="comma separated" /></div>
          <div><Label>Notes</Label><Textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.title.trim()) return; addBook({ ...f, id: uid(), tags: f.tags.split(',').map((t: string) => t.trim()).filter(Boolean), currentPage: 0, createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}