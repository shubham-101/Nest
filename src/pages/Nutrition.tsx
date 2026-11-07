import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';

export default function Nutrition() {
  const meals = useStore(s => s.meals);
  const target = useStore(s => s.nutritionTarget);
  const updateTarget = useStore(s => s.updateNutritionTarget);
  const addMeal = useStore(s => s.addMeal);
  const deleteMeal = useStore(s => s.deleteMeal);

  const [open, setOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [f, setF] = useState<any>({ type: 'breakfast', name: '', calories: 0, protein: 0, carbs: 0, fat: 0, note: '', date: todayStr() });
  const [tf, setTf] = useState<any>({ ...target });

  const today = todayStr();
  const todayMeals = meals.filter(m => m.date === today);
  const totals = todayMeals.reduce((a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, carbs: a.carbs + m.carbs, fat: a.fat + m.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macro = (label: string, val: number, tgt: number, color: string) => (
    <div>
      <div className="flex justify-between text-xs text-text-muted mb-1"><span>{label}</span><span>{val} / {tgt}</span></div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full" style={{ width: `${Math.min(100, (val / (tgt || 1)) * 100)}%`, background: color }} /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Nutrition</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setTf({ ...target }); setTargetOpen(true); }}>Targets</Button>
          <Button onClick={() => { setF({ type: 'breakfast', name: '', calories: 0, protein: 0, carbs: 0, fat: 0, note: '', date: today }); setOpen(true); }}><Plus size={16} /> Add meal</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Today's macros</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {macro('Calories', totals.calories, target.calories, '#0f766e')}
          {macro('Protein (g)', totals.protein, target.protein, '#7c3aed')}
          {macro('Carbs (g)', totals.carbs, target.carbs, '#2563eb')}
          {macro('Fat (g)', totals.fat, target.fat, '#d97706')}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {todayMeals.map(m => (
          <Card key={m.id} className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{m.name} <span className="text-xs text-text-muted">· {m.type}</span></div>
              <div className="text-xs text-text-muted">{m.calories} kcal · P{m.protein} C{m.carbs} F{m.fat}</div>
            </div>
            <button onClick={() => deleteMeal(m.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
          </Card>
        ))}
        {todayMeals.length === 0 && <Card className="p-8 text-center text-text-muted">No meals logged today.</Card>}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent meals</CardTitle></CardHeader>
        <CardContent>
          {meals.slice(0, 15).map(m => (
            <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0 text-sm">
              <span className="font-medium">{m.name}</span>
              <span className="text-text-muted">{m.type}</span>
              <span className="text-text-muted">{m.calories} kcal</span>
              <span className="ml-auto text-xs text-text-muted">{m.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Modal open={open} onOpenChange={setOpen} title="Add meal">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label><Select value={f.type} onValueChange={v => setF({ ...f, type: v })} options={[{ value: 'breakfast', label: 'Breakfast' }, { value: 'lunch', label: 'Lunch' }, { value: 'dinner', label: 'Dinner' }, { value: 'snack', label: 'Snack' }]} /></div>
            <div><Label>Date</Label><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div><Label>Name</Label><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-4 gap-2">
            <div><Label>Cal</Label><Input type="number" value={f.calories} onChange={e => setF({ ...f, calories: Number(e.target.value) })} /></div>
            <div><Label>Protein</Label><Input type="number" value={f.protein} onChange={e => setF({ ...f, protein: Number(e.target.value) })} /></div>
            <div><Label>Carbs</Label><Input type="number" value={f.carbs} onChange={e => setF({ ...f, carbs: Number(e.target.value) })} /></div>
            <div><Label>Fat</Label><Input type="number" value={f.fat} onChange={e => setF({ ...f, fat: Number(e.target.value) })} /></div>
          </div>
          <div><Label>Note</Label><Input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.name.trim()) return; addMeal({ ...f, id: uid(), createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={targetOpen} onOpenChange={setTargetOpen} title="Daily targets">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Calories</Label><Input type="number" value={tf.calories} onChange={e => setTf({ ...tf, calories: Number(e.target.value) })} /></div>
            <div><Label>Protein (g)</Label><Input type="number" value={tf.protein} onChange={e => setTf({ ...tf, protein: Number(e.target.value) })} /></div>
            <div><Label>Carbs (g)</Label><Input type="number" value={tf.carbs} onChange={e => setTf({ ...tf, carbs: Number(e.target.value) })} /></div>
            <div><Label>Fat (g)</Label><Input type="number" value={tf.fat} onChange={e => setTf({ ...tf, fat: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTargetOpen(false)}>Cancel</Button>
            <Button onClick={() => { updateTarget(tf); setTargetOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}