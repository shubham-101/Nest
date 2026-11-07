import { useState } from 'react';
import { useStore } from '../store/useStore';
import { isCompleted, streakForHabit } from '../lib/stats';
import { todayStr } from '../lib/dates';
import { uid } from '../lib/id';
import { Check, Flame, MoreHorizontal, Pencil, Trash2, Archive } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './ui/Button';


export const HabitRow = ({ habit, compact, onEdit }: { habit: any; compact?: boolean; onEdit?: (h: any) => void }) => {
  const entries = useStore(s => s.entries);
  const habits = useStore(s => s.habits);
  const upsertEntry = useStore(s => s.upsertEntry);
  const deleteHabit = useStore(s => s.deleteHabit);
  const archiveHabit = useStore(s => s.archiveHabit);
  const updateHabit = useStore(s => s.updateHabit);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [menu, setMenu] = useState(false);
  const today = todayStr();
  const entry = entries.find(e => e.habitId === habit.id && e.date === today);
  const done = isCompleted(habit, entry);
  const streak = streakForHabit(habit, entries);

  const toggle = () => {
    if (habit.type === 'boolean') {
      upsertEntry({
        id: entry?.id || uid(),
        habitId: habit.id,
        date: today,
        value: !done,
        note: entry?.note,
        createdAt: entry?.createdAt || new Date().toISOString(),
      });
      if (!done) {
        awardXP(10);
        try { confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: [habit.color, '#ffffff'] }); } catch {}
      }
    } else {
      // open input
      setShowNote(true);
    }
  };

  const submitValue = (val: any) => {
    const wasDone = isCompleted(habit, entry);
    upsertEntry({
      id: entry?.id || uid(),
      habitId: habit.id,
      date: today,
      value: val,
      note: note || entry?.note,
      createdAt: entry?.createdAt || new Date().toISOString(),
    });
    const nowDone = isCompleted(habit, { ...entry, value: val } as any);
    if (!wasDone && nowDone) {
      awardXP(15);
      try { confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: [habit.color, '#ffffff'] }); } catch {}
    }
    setShowNote(false);
  };

  return (
    <div className={`bg-surface border border-border rounded-2xl p-4 transition-all ${done ? 'opacity-90' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${done ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}
          aria-label="toggle"
        >
          {done ? <Check size={20} /> : habit.icon}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{habit.name}</span>
            {streak > 0 && (
              <span className="text-xs text-orange-500 flex items-center gap-0.5"><Flame size={12} />{streak}</span>
            )}
          </div>
          {habit.description && <div className="text-xs text-text-muted truncate">{habit.description}</div>}
          {habit.stackAfter && (
            <div className="text-xs text-accent/80 truncate">↳ after {habits?.find?.((x: any) => x.id === habit.stackAfter)?.name || 'linked habit'}</div>
          )}
          {!compact && habit.type !== 'boolean' && entry && (
            <div className="text-xs text-text-muted mt-0.5">Today: {formatValue(habit, entry.value)}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {habit.type !== 'boolean' && (
            <Button variant="ghost" size="sm" onClick={() => setShowNote(v => !v)}>Log</Button>
          )}
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="more" onClick={() => setMenu(v => !v)}><MoreHorizontal size={16} /></Button>
            {menu && (
              <div className="absolute right-0 top-9 z-20 bg-surface border border-border rounded-xl shadow-lg p-1 w-40">
                {onEdit && <button onClick={() => { onEdit(habit); setMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-2 flex items-center gap-2"><Pencil size={13} /> Edit</button>}
                <button onClick={() => {
                  const today = todayStr();
                  const frozen = habit.frozenDays || [];
                  const next = frozen.includes(today) ? frozen.filter((d: string) => d !== today) : [...frozen, today];
                  updateHabit(habit.id, { frozenDays: next });
                  setMenu(false);
                }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-2 flex items-center gap-2">❄️ { (habit.frozenDays || []).includes(new Date().toISOString().slice(0,10)) ? 'Unfreeze today' : 'Freeze today' }</button>
                <button onClick={() => { archiveHabit(habit.id, !habit.archived); setMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-2 flex items-center gap-2"><Archive size={13} /> Archive</button>
                <button onClick={() => { if (confirm('Delete habit?')) deleteHabit(habit.id); setMenu(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-2 text-danger flex items-center gap-2"><Trash2 size={13} /> Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNote && habit.type !== 'boolean' && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <ValueInput habit={habit} entry={entry} onSubmit={submitValue} />
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm" />
        </div>
      )}
    </div>
  );
};

function ValueInput({ habit, entry, onSubmit }: any) {
  const [val, setVal] = useState(entry?.value ?? (habit.type === 'checklist' ? [] : ''));
  if (habit.type === 'numeric' || habit.type === 'duration' || habit.type === 'rating' || habit.type === 'mood') {
    return (
      <div className="flex gap-2">
        <input type="number" value={val} onChange={e => setVal(e.target.value)} className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm" placeholder={habit.unit || 'value'} />
        <Button size="sm" onClick={() => onSubmit(Number(val))}>Save</Button>
      </div>
    );
  }
  if (habit.type === 'checklist') {
    return (
      <div className="space-y-1">
        {(habit.checklistItems || []).map((item: string, i: number) => {
          const arr = Array.isArray(val) ? val : [];
          const checked = arr.includes(item);
          return (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={checked} onChange={() => {
                const next = checked ? arr.filter((x: string) => x !== item) : [...arr, item];
                setVal(next);
              }} />
              {item}
            </label>
          );
        })}
        <Button size="sm" onClick={() => onSubmit(val)}>Save</Button>
      </div>
    );
  }
  return null;
}

function formatValue(habit: any, v: any) {
  if (Array.isArray(v)) return v.join(', ') || '—';
  if (habit.type === 'duration') return `${v} ${habit.unit || 'min'}`;
  if (habit.type === 'numeric') return `${v} ${habit.unit || ''}`;
  return String(v);
}

function awardXP(amount: number) {
  const s = useStore.getState();
  const newXp = s.stats.xp + amount;
  const newLevel = Math.floor(newXp / 100) + 1;
  s.updateStats({ xp: newXp, level: newLevel, totalCompletions: s.stats.totalCompletions + 1 });
}