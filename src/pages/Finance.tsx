import { useState } from 'react';
import { useStore } from '../store/useStore';
import { uid } from '../lib/id';
import { todayStr } from '../lib/dates';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Income', 'Other'];

export default function Finance() {
  const entries = useStore(s => s.financeEntries);
  const add = useStore(s => s.addFinanceEntry);
  const del = useStore(s => s.deleteFinanceEntry);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [f, setF] = useState<any>({ type: 'expense', amount: 0, category: 'Food', note: '', date: todayStr() });

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);
  const income = entries.filter(e => e.type === 'income').reduce((a, e) => a + e.amount, 0);
  const expense = entries.filter(e => e.type === 'expense').reduce((a, e) => a + e.amount, 0);
  const balance = income - expense;

  // monthly by category
  const catMap: Record<string, number> = {};
  entries.filter(e => e.type === 'expense').forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Finance</h1>
        <Button onClick={() => { setF({ type: 'expense', amount: 0, category: 'Food', note: '', date: todayStr() }); setOpen(true); }}><Plus size={16} /> Add entry</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="py-5"><div className="text-xs text-text-muted">Income</div><div className="text-2xl font-bold text-green-600">{income.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="py-5"><div className="text-xs text-text-muted">Expenses</div><div className="text-2xl font-bold text-red-600">{expense.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="py-5"><div className="text-xs text-text-muted">Balance</div><div className={`text-2xl font-bold ${balance >= 0 ? 'text-accent' : 'text-red-600'}`}>{balance.toLocaleString()}</div></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Select value={filter} onValueChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} />
      </div>

      {Object.keys(catMap).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Spending by category</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="flex items-center gap-3 py-1.5">
                <span className="flex-1 text-sm">{cat}</span>
                <div className="w-40 h-2 rounded-full bg-surface-2 overflow-hidden"><div className="h-full bg-accent" style={{ width: `${(amt / (expense || 1)) * 100}%` }} /></div>
                <span className="text-sm font-medium w-20 text-right">{amt.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map(e => (
          <Card key={e.id} className="p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${e.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {e.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{e.category} {e.note && <span className="text-text-muted">· {e.note}</span>}</div>
              <div className="text-xs text-text-muted">{e.date}</div>
            </div>
            <div className={`font-semibold ${e.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString()}</div>
            <button onClick={() => del(e.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
          </Card>
        ))}
        {filtered.length === 0 && <Card className="p-8 text-center text-text-muted">No entries yet.</Card>}
      </div>

      <Modal open={open} onOpenChange={setOpen} title="Add entry">
        <div className="space-y-4">
          <div><Label>Type</Label><Select value={f.type} onValueChange={v => setF({ ...f, type: v })} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Amount</Label><Input type="number" value={f.amount} onChange={e => setF({ ...f, amount: Number(e.target.value) })} /></div>
            <div><Label>Date</Label><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></div>
          </div>
          <div><Label>Category</Label><Select value={f.category} onValueChange={v => setF({ ...f, category: v })} options={CATEGORIES.map(c => ({ value: c, label: c }))} /></div>
          <div><Label>Note</Label><Input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (!f.amount) return; add({ ...f, id: uid(), createdAt: new Date().toISOString() } as any); setOpen(false); }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}