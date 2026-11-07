import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function Portfolio() {
  const items = useStore(s => s.portfolio);
  const add = useStore(s => s.addPortfolio);
  const update = useStore(s => s.updatePortfolio);
  const del = useStore(s => s.deletePortfolio);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    if (!form.title?.trim()) return;
    add({
      id: uid(),
      title: form.title,
      description: form.description,
      image: form.image,
      link: form.link,
      tags: (form.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      shipped: !!form.shipped,
    });
    setOpen(false);
    setForm({});
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setForm((fm: any) => ({ ...fm, image: r.result as string }));
    r.readAsDataURL(f);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Portfolio / shipped work</h1>
        <Button onClick={() => { setForm({}); setOpen(true); }}><Plus size={16} /> Add item</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <Card key={it.id} className="overflow-hidden">
            {it.image && <div className="aspect-video bg-surface-2"><img src={it.image} className="w-full h-full object-cover" /></div>}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{it.title}</span>
                {it.shipped && <span className="text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-full">Shipped</span>}
              </div>
              {it.description && <div className="text-xs text-text-muted line-clamp-3">{it.description}</div>}
              <div className="flex flex-wrap gap-1">
                {(it.tags || []).map(t => <span key={t} className="text-xs bg-surface-2 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1"><ExternalLink size={12} /> Open</a>}
                <button onClick={() => update(it.id, { shipped: !it.shipped })} className="text-xs text-text-muted hover:text-text">
                  {it.shipped ? 'Unmark shipped' : 'Mark shipped'}
                </button>
                <button onClick={() => del(it.id)} className="ml-auto text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {items.length === 0 && <Card className="p-10 text-center text-text-muted">No portfolio items yet. Ship something!</Card>}

      <Modal open={open} onOpenChange={setOpen} title="Add portfolio item">
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div><Label>Image</Label>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Upload</Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {form.image && <img src={form.image} className="mt-2 rounded-lg max-h-32" />}
          </div>
          <div><Label>Link</Label><Input value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} /></div>
          <div><Label>Tags</Label><Input value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.shipped} onChange={e => setForm({ ...form, shipped: e.target.checked })} /> Shipped</label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}