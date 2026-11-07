import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { HabitRow } from '../components/HabitRow';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Search, Download } from 'lucide-react';
import { HABIT_ICONS, HABIT_COLORS } from '../lib/constants';
import { toCSV, downloadCSV } from '../lib/export';
import { DEFAULT_TEMPLATES } from '../lib/templates';

const CATEGORIES = ['design','health','mind','learning','social','creative','productivity','other'];

export default function Habits() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const addHabit = useStore(s => s.addHabit);
  const updateHabit = useStore(s => s.updateHabit);
  const reorderHabits = useStore(s => s.reorderHabits);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [templateOpen, setTemplateOpen] = useState(false);

  const active = habits.filter(h => !h.archived);
  const archived = habits.filter(h => h.archived);

  const filtered = active.filter(h => {
    if (filter !== 'all' && h.category !== filter) return false;
    if (q && !h.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const openNew = () => { setEditing(null); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Habits</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>Templates</Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csv = toCSV(entries, habits);
            downloadCSV(csv);
          }}><Download size={14} /> CSV</Button>
          <Button onClick={openNew}><Plus size={16} /> New habit</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 flex-1 min-w-[200px]">
          <Search size={15} className="text-text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search habits..." className="h-10 flex-1 bg-transparent outline-none text-sm" />
        </div>
        <Select value={filter} onValueChange={setFilter} options={[{value:'all',label:'All categories'}, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
      </div>

      <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))} collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIndex = habits.findIndex(h => h.id === active.id);
        const newIndex = habits.findIndex(h => h.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const reordered = arrayMove(habits, oldIndex, newIndex);
        reorderHabits(reordered.map(h => h.id));
      }}>
        <SortableContext items={filtered.map(h => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filtered.map(h => <SortableHabitRow key={h.id} habit={h} onEdit={(hh: any) => { setEditing(hh); setOpen(true); }} />)}
            {filtered.length === 0 && <Card className="p-8 text-center text-text-muted">No habits match.</Card>}
          </div>
        </SortableContext>
      </DndContext>

      {archived.length > 0 && (
        <div>
          <h2 className="font-display text-xl mb-3">Archived</h2>
          <div className="space-y-3 opacity-60">
            {archived.map(h => <HabitRow key={h.id} habit={h} onEdit={(hh: any) => { setEditing(hh); setOpen(true); }} />)}
          </div>
        </div>
      )}

      <HabitModal open={open} onOpenChange={setOpen} editing={editing} onSave={(data: any) => {
        if (editing) updateHabit(editing.id, data);
        else addHabit({ ...data, id: uid(), createdAt: new Date().toISOString(), order: habits.length, archived: false });
        setOpen(false);
      }} />
      <Modal open={templateOpen} onOpenChange={setTemplateOpen} title="Apply a template">
        <div className="space-y-3">
          {DEFAULT_TEMPLATES.map(t => (
            <button key={t.id} onClick={() => {
              t.habits.forEach((h, i) => addHabit({ ...h, id: uid(), createdAt: new Date().toISOString(), order: habits.length + i, archived: false, checklistItems: h.checklistItems || [] } as any));
              setTemplateOpen(false);
            }} className="w-full text-left p-4 rounded-xl border border-border hover:border-accent transition-all">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-text-muted">{t.description} · {t.habits.length} habits</div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function HabitModal({ open, onOpenChange, editing, onSave }: any) {
  const habits = useStore(s => s.habits);
  const [form, setForm] = useState<any>({});
  React.useEffect(() => {
    if (open) {
      setForm(editing ? { ...editing } : {
        name: '', description: '', icon: '✨', color: '#0f766e', type: 'boolean', category: 'design',
        frequency: 'daily', target: 10, unit: 'min', daysOfWeek: [1,2,3,4,5,6,0], reminderTime: '', checklistItems: [],
      });
    }
  }, [open, editing]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    const checklistItems = typeof form.checklistItems === 'string'
      ? form.checklistItems.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : form.checklistItems;
    onSave({ ...form, checklistItems });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={editing ? 'Edit habit' : 'New habit'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Sketch 10 min" required />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select value={form.type || 'boolean'} onValueChange={v => set('type', v)} options={[
              { value: 'boolean', label: 'Yes / No' },
              { value: 'numeric', label: 'Numeric (count)' },
              { value: 'duration', label: 'Duration (time)' },
              { value: 'mood', label: 'Mood' },
              { value: 'rating', label: 'Rating 1-5' },
              { value: 'checklist', label: 'Checklist' },
            ]} />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category || 'design'} onValueChange={v => set('category', v)} options={CATEGORIES.map(c => ({ value: c, label: c }))} />
          </div>
        </div>
        {(form.type === 'numeric' || form.type === 'duration') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Target</Label>
              <Input type="number" value={form.target || ''} onChange={e => set('target', Number(e.target.value))} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit || ''} onChange={e => set('unit', e.target.value)} placeholder="min, pages..." />
            </div>
          </div>
        )}
        {form.type === 'checklist' && (
          <div>
            <Label>Checklist items (one per line)</Label>
            <Textarea value={Array.isArray(form.checklistItems) ? form.checklistItems.join('\n') : (form.checklistItems || '')} onChange={e => set('checklistItems', e.target.value)} rows={4} />
          </div>
        )}
        <div>
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-1.5">
            {HABIT_ICONS.map(ic => (
              <button type="button" key={ic} onClick={() => set('icon', ic)} className={`h-9 w-9 rounded-lg text-lg ${form.icon === ic ? 'bg-accent-soft ring-2 ring-accent' : 'bg-surface-2 hover:bg-border'}`}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-1.5">
            {HABIT_COLORS.map(c => (
              <button type="button" key={c} onClick={() => set('color', c)} className={`h-8 w-8 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div>
          <Label>Reminder time (optional)</Label>
          <Input type="time" value={form.reminderTime || ''} onChange={e => set('reminderTime', e.target.value)} />
        </div>
        <div>
          <Label>Stack after (optional)</Label>
          <Select value={form.stackAfter || ''} onValueChange={v => set('stackAfter', v)} options={[{ value: '', label: 'None' }, ...habits.filter(h => h.id !== editing?.id).map(h => ({ value: h.id, label: h.name }))]} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">{editing ? 'Save changes' : 'Create habit'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function SortableHabitRow({ habit, onEdit }: { habit: any; onEdit?: (h: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-stretch gap-2">
        <button {...listeners} className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text px-1 self-center" aria-label="drag">⋮⋮</button>
        <div className="flex-1">
          <HabitRow habit={habit} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
}