import { useState } from 'react';
import { useStore } from '../store/useStore';
import { isCompleted } from '../lib/stats';
import { heatmapData } from '../lib/stats';
import { monthDays, fmtDate, parseISO } from '../lib/dates';
import { uid } from '../lib/id';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Label } from '../components/ui/Input';
import { ChevronLeft, ChevronRight, Pencil, Check, Trash2, Save, Bell, BellPlus } from 'lucide-react';
import { occursOn } from '../lib/reminders';
import { ReminderModal } from '../components/ReminderModal';

export default function CalendarPage() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const reminders = useStore(s => s.reminders);
  const deleteReminder = useStore(s => s.deleteReminder);
  const updateReminder = useStore(s => s.updateReminder);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const days = monthDays(cursor);
  const heat = heatmapData(entries, habits, 365);
  const heatMap = new Map(heat.map(h => [h.date, h.count]));
  const maxCount = Math.max(1, ...heat.map(h => h.count));

  const firstDay = parseISO(days[0]);
  const startPad = firstDay.getDay(); // 0-6
  // adjust for weekStartsOn 1
  const pad = (startPad + 6) % 7;

  const selectedEntries = selected ? entries.filter(e => e.date === selected) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Calendar</h1>
        <Button onClick={() => setReminderOpen(true)}><BellPlus size={16} /> New reminder</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{fmtDate(cursor, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}><ChevronLeft size={16} /></Button>
            <Button variant="ghost" size="icon" onClick={() => setCursor(new Date())}>Today</Button>
            <Button variant="ghost" size="icon" onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}><ChevronRight size={16} /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center text-xs text-text-muted font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: pad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(d => {
              const count = heatMap.get(d) || 0;
              const intensity = count / maxCount;
              const bg = count === 0 ? 'bg-surface-2' : `rgba(15,118,110,${0.2 + intensity * 0.8})`;
              const isSelected = selected === d;
              const hasReminder = reminders.some(r => occursOn(r, d));
              return (
                <button
                  key={d}
                  onClick={() => { setSelected(d); setEditing(false); }}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${isSelected ? 'ring-2 ring-accent' : ''}`}
                  style={{ background: count === 0 ? undefined : bg, color: intensity > 0.5 ? 'white' : undefined }}
                >
                  {parseISO(d).getDate()}
                  {hasReminder && <span className="h-1 w-1 rounded-full bg-amber-500 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader><CardTitle className="text-base">Activity heatmap (last year)</CardTitle></CardHeader>
        <CardContent>
          <HeatmapGrid heat={heat} />
        </CardContent>
      </Card>

      {/* reminders for selected day */}
      {selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Bell size={16} className="text-amber-500" /> Reminders · {fmtDate(selected)}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setReminderOpen(true)}><BellPlus size={14} /> Add</Button>
          </CardHeader>
          <CardContent>
            {reminders.filter(r => occursOn(r, selected)).length === 0 && <div className="text-text-muted text-sm">No reminders on this day.</div>}
            {reminders.filter(r => occursOn(r, selected)).map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-amber-500"><Bell size={15} /></span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-text-muted">{r.time}{r.repeat !== 'none' ? ` · repeats ${r.repeat}` : ''}{r.note ? ` · ${r.note}` : ''}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => updateReminder(r.id, { done: !r.done })}>
                  {r.done ? 'Reopen' : 'Done'}
                </Button>
                <button onClick={() => deleteReminder(r.id)} className="text-text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {selected && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{fmtDate(selected)}</CardTitle>
            <Button size="sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit entries</Button>
          </CardHeader>
          <CardContent>
            {selectedEntries.length === 0 && <div className="text-text-muted text-sm">No entries. Click "Edit entries" to add some.</div>}
            {selectedEntries.map(e => {
              const h = habits.find(x => x.id === e.habitId);
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-lg">{h?.icon}</span>
                  <span className="flex-1 text-sm">{h?.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isCompleted(h!, e) ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-text-muted'}`}>
                    {isCompleted(h!, e) ? 'Done' : 'Missed'}
                  </span>
                  {e.note && <span className="text-xs text-text-muted italic">{e.note}</span>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ---- date editor ---- */}
      <Modal open={editing} onOpenChange={setEditing} title={selected ? `Edit ${fmtDate(selected)}` : 'Edit entries'}>
        {selected && <DateEditor date={selected} onDone={() => setEditing(false)} />}
      </Modal>

      <ReminderModal open={reminderOpen} onOpenChange={setReminderOpen} initialDate={selected || undefined} />
    </div>
  );
}

function DateEditor({ date, onDone }: { date: string; onDone: () => void }) {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const upsertEntry = useStore(s => s.upsertEntry);
  const deleteEntry = useStore(s => s.deleteEntry);
  const moods = useStore(s => s.moods);
  const upsertMood = useStore(s => s.upsertMood);

  const active = habits.filter(h => !h.archived);
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moodToday = moods.find(m => m.date === date);
  const [moodInit, setMoodInit] = useState(false);
  if (!moodInit && moodToday) {
    setMood(moodToday.mood);
    setEnergy(moodToday.energy);
    setMoodInit(true);
  }

  const commit = (habit: any, value: any, note?: string) => {
    const existing = entries.find(e => e.habitId === habit.id && e.date === date);
    upsertEntry({
      id: existing?.id || uid(),
      habitId: habit.id,
      date,
      value,
      note: note !== undefined ? note : (existing?.note || ''),
      createdAt: existing?.createdAt || new Date().toISOString(),
    });
  };

  const toggleBoolean = (habit: any) => {
    const existing = entries.find(e => e.habitId === habit.id && e.date === date);
    const cur = existing?.value === true;
    commit(habit, !cur);
    setDrafts(d => ({ ...d, [habit.id]: !cur }));
  };

  const saveAll = () => {
    for (const h of active) {
      const value = drafts[h.id];
      if (value === undefined) continue;
      commit(h, value, notes[h.id]);
    }
    if (mood !== null && energy !== null) {
      upsertMood({ id: moodToday?.id || uid(), date, mood, energy, note: moodToday?.note || '', createdAt: moodToday?.createdAt || new Date().toISOString() });
    }
    onDone();
  };

  const clearHabit = (habit: any) => {
    const existing = entries.find(e => e.habitId === habit.id && e.date === date);
    if (existing) deleteEntry(existing.id);
    setDrafts(d => { const next = { ...d }; delete next[habit.id]; return next; });
    setNotes(n => { const next = { ...n }; delete next[habit.id]; return next; });
  };

  const markAllDone = () => {
    const next: Record<string, any> = {};
    for (const h of active) {
      const existing = entries.find(e => e.habitId === h.id && e.date === date);
      if (existing && isCompleted(h, existing)) continue;
      if (h.type === 'boolean') next[h.id] = true;
      else if (h.type === 'checklist') next[h.id] = h.checklistItems || [];
      else if (h.type === 'numeric' || h.type === 'duration') next[h.id] = h.target || 1;
      else next[h.id] = 5;
    }
    setDrafts(d => ({ ...d, ...next }));
  };

  const valueOf = (habit: any) => {
    if (habit.id in drafts) return drafts[habit.id];
    const existing = entries.find(e => e.habitId === habit.id && e.date === date);
    return existing ? existing.value : (habit.type === 'checklist' ? [] : habit.type === 'boolean' ? false : '');
  };

  return (
    <div className="space-y-4 max-h-[65vh] overflow-auto pr-1">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={markAllDone}><Check size={14} /> Mark all done</Button>
      </div>

      {active.length === 0 && <div className="text-text-muted text-sm">No active habits. Add one in Habits first.</div>}

      {active.map(h => {
        const value = valueOf(h);
        const done = (h.type === 'boolean' && value === true) ||
          ((h.type === 'numeric' || h.type === 'duration') && (Number(value) || 0) >= (h.target || 1)) ||
          ((h.type === 'mood' || h.type === 'rating') && Number(value) > 0) ||
          (h.type === 'checklist' && Array.isArray(value) && value.length > 0);
        return (
          <div key={h.id} className={`border border-border rounded-xl p-3 space-y-2 transition-opacity ${done ? 'bg-accent-soft/30' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{h.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{h.name}</div>
                {h.type !== 'boolean' && <div className="text-xs text-text-muted">{h.type}{h.unit ? ` · ${h.unit}` : ''}{h.target ? ` · target ${h.target}` : ''}</div>}
              </div>
              {done && <Check size={16} className="text-accent" />}
              <button onClick={() => clearHabit(h)} className="text-text-muted hover:text-danger" title="Clear this entry"><Trash2 size={14} /></button>
            </div>

            {h.type === 'boolean' && (
              <button onClick={() => toggleBoolean(h)} className={`w-full h-9 rounded-lg text-sm font-medium transition-colors ${done ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>
                {done ? '✓ Done (click to undo)' : 'Mark done'}
              </button>
            )}

            {(h.type === 'numeric' || h.type === 'duration') && (
              <div className="flex gap-2">
                <Input type="number" value={value} placeholder={h.unit || 'value'} onChange={e => setDrafts(d => ({ ...d, [h.id]: e.target.value === '' ? 0 : Number(e.target.value) }))} />
                <Button size="sm" variant="outline" onClick={() => commit(h, value, notes[h.id])}>Save</Button>
              </div>
            )}

            {(h.type === 'mood' || h.type === 'rating') && (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setDrafts(d => ({ ...d, [h.id]: n }))} className={`flex-1 h-9 rounded-lg text-sm ${Number(value) === n ? 'bg-accent text-white' : 'bg-surface-2 hover:bg-border'}`}>{n}</button>
                ))}
              </div>
            )}

            {h.type === 'checklist' && (
              <div className="space-y-1">
                {(h.checklistItems || []).map((item: string, i: number) => {
                  const arr = Array.isArray(value) ? value : [];
                  const checked = arr.includes(item);
                  return (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={checked} onChange={() => {
                        const next = checked ? arr.filter((x: string) => x !== item) : [...arr, item];
                        setDrafts(d => ({ ...d, [h.id]: next }));
                      }} />
                      {item}
                    </label>
                  );
                })}
              </div>
            )}

            <Input value={notes[h.id] ?? entries.find(e => e.habitId === h.id && e.date === date)?.note ?? ''} onChange={e => setNotes(n => ({ ...n, [h.id]: e.target.value }))} placeholder="Note (optional)" className="h-8 text-xs" />
          </div>
        );
      })}

      {/* mood & energy for the date */}
      <div className="border border-border rounded-xl p-3 space-y-2">
        <Label>Mood & energy</Label>
        <div className="flex gap-1 mb-2">
          {['😞', '😕', '😐', '🙂', '😄'].map((emo, i) => (
            <button key={i} onClick={() => setMood(i + 1)} className={`flex-1 h-9 rounded-lg text-lg ${mood === i + 1 ? 'bg-accent-soft scale-110' : 'hover:bg-surface-2'}`}>{emo}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {['🪫', '🔋', '⚡', '🚀', '🔥'].map((emo, i) => (
            <button key={i} onClick={() => setEnergy(i + 1)} className={`flex-1 h-9 rounded-lg text-lg ${energy === i + 1 ? 'bg-accent-soft scale-110' : 'hover:bg-surface-2'}`}>{emo}</button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onDone}>Close</Button>
        <Button onClick={saveAll}><Save size={14} /> Save entries</Button>
      </div>
    </div>
  );
}

function HeatmapGrid({ heat }: { heat: { date: string; count: number }[] }) {
  // group into weeks (columns) of 7
  const weeks: { date: string; count: number }[][] = [];
  // pad start to align Monday
  const first = parseISO(heat[0].date);
  const pad = (first.getDay() + 6) % 7;
  const flat = [...Array(pad).fill(null), ...heat];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7) as any);
  }
  const max = Math.max(1, ...heat.map(h => h.count));
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((d, di) => {
              if (!d) return <div key={di} className="h-3 w-3" />;
              const intensity = d.count / max;
              const bg = d.count === 0 ? 'bg-surface-2' : undefined;
              const style = d.count === 0 ? {} : { background: `rgba(15,118,110,${0.15 + intensity * 0.85})` };
              return <div key={di} title={`${d.date}: ${d.count}`} className={`h-3 w-3 rounded-sm ${bg}`} style={style} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}