import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Plus, Trash2, Palette, Link as LinkIcon } from 'lucide-react';

export default function Inspiration() {
  const items = useStore(s => s.inspirations);
  const add = useStore(s => s.addInspiration);
  const del = useStore(s => s.deleteInspiration);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => setForm({ title: '', url: '', note: '', tags: '', colorPalette: [] });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setForm((fm: any) => ({ ...fm, image: r.result as string }));
    r.readAsDataURL(f);
  };

  const extractColors = async () => {
    if (!form.image) return;
    // simple: sample 5 random colors from image via canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      const colors = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const idx = Math.floor(Math.random() * (data.length / 4)) * 4;
        const hex = '#' + [data[idx], data[idx+1], data[idx+2]].map(x => x.toString(16).padStart(2, '0')).join('');
        colors.add(hex);
        if (colors.size >= 5) break;
      }
      setForm((fm: any) => ({ ...fm, colorPalette: Array.from(colors) }));
    };
    img.src = form.image;
  };

  const save = () => {
    if (!form.title?.trim() && !form.image && !form.url) return;
    add({
      id: uid(),
      title: form.title || 'Untitled',
      url: form.url,
      image: form.image,
      tags: (form.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      note: form.note,
      colorPalette: form.colorPalette,
      createdAt: new Date().toISOString(),
    });
    setOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Inspiration</h1>
        <Button onClick={() => { reset(); setOpen(true); }}><Plus size={16} /> Capture</Button>
      </div>

      {items.length === 0 && <Card className="p-10 text-center text-text-muted">No inspiration captured yet. Start collecting!</Card>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => (
          <Card key={it.id} className="overflow-hidden group">
            {it.image && (
              <div className="aspect-video bg-surface-2 overflow-hidden">
                <img src={it.image} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="font-medium">{it.title}</div>
              {it.note && <div className="text-xs text-text-muted line-clamp-2">{it.note}</div>}
              {it.colorPalette && it.colorPalette.length > 0 && (
                <div className="flex gap-1">
                  {it.colorPalette.map((c, i) => <div key={i} className="h-5 w-5 rounded-full border border-border" style={{ background: c }} title={c} />)}
                </div>
              )}
              {(it.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(it.tags || []).map(t => <span key={t} className="text-xs bg-surface-2 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                {it.url && <a href={it.url} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1"><LinkIcon size={12} /> Open</a>}
                <button onClick={() => del(it.id)} className="ml-auto text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Capture inspiration">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Image</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Upload image</Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              {form.image && <Button variant="ghost" size="sm" onClick={extractColors}><Palette size={14} /> Extract palette</Button>}
            </div>
            {form.image && <img src={form.image} className="mt-2 rounded-lg max-h-40" />}
          </div>
          <div>
            <Label>URL</Label>
            <Input value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <Label>Note</Label>
            <Textarea value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} rows={3} />
          </div>
          {form.colorPalette && form.colorPalette.length > 0 && (
            <div className="flex gap-1">
              {form.colorPalette.map((c: string, i: number) => <div key={i} className="h-6 w-6 rounded-full border border-border" style={{ background: c }} />)}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}