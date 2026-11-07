
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { todayStr } from '../../lib/dates';
import { Moon, Sun, Menu, Bell, Check, Trash2, Clock, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { nextOccurrence, timeUntil, dayKey } from '../../lib/reminders';

export const Topbar = ({ onMenu }: { onMenu: () => void }) => {
  const settings = useStore(s => s.settings);
  const moods = useStore(s => s.moods);
  const reminders = useStore(s => s.reminders);
  const updateReminder = useStore(s => s.updateReminder);
  const deleteReminder = useStore(s => s.deleteReminder);
  const upsertEntry = useStore(s => s.upsertEntry);
  const updateSettings = useStore(s => s.updateSettings);
  const [bellOpen, setBellOpen] = useState(false);
  const navigate = useNavigate();
  const m = moods.find(x => x.date === todayStr());
  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
  const ENERGY = ['🪫', '🔋', '⚡', '🚀', '🔥'];
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggle = () => updateSettings({ theme: dark ? 'light' : 'dark' });

  // upcoming reminders: today + next 7 days, not done
  const upcoming = reminders
    .filter(r => !r.done && nextOccurrence(r))
    .sort((a, b) => (nextOccurrence(a)?.getTime() || 0) - (nextOccurrence(b)?.getTime() || 0))
    .slice(0, 12);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <button onClick={onMenu} className="md:hidden p-2 rounded-lg hover:bg-surface-2">
          <Menu size={20} />
        </button>
        <div className="flex-1" />
        {m && (
          <div className="flex items-center gap-1 text-lg mr-2" title={`Mood ${m.mood} · Energy ${m.energy}`}>
            <span>{MOODS[m.mood - 1]}</span>
            <span>{ENERGY[m.energy - 1]}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* notification bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setBellOpen(v => !v)} aria-label="Reminders">
              <Bell size={18} />
            </Button>
            {upcoming.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[10px] leading-4 text-center font-bold pointer-events-none">
                {upcoming.length}
              </span>
            )}
            {bellOpen && (
              <div className="absolute right-0 top-10 z-50 w-80 bg-surface border border-border rounded-2xl shadow-xl p-2 max-h-96 overflow-auto">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm font-semibold">Upcoming reminders</span>
                  <button onClick={() => setBellOpen(false)} className="text-text-muted hover:text-text"><X size={14} /></button>
                </div>
                {upcoming.length === 0 && <div className="px-2 py-4 text-sm text-text-muted">No upcoming reminders.</div>}
                {upcoming.map(r => {
                  const next = nextOccurrence(r);
                  return (
                    <div key={r.id} className="px-2 py-2 rounded-xl hover:bg-surface-2 flex items-start gap-2">
                      <Bell size={15} className="text-amber-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{r.title}</div>
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={10} /> {next ? `in ${timeUntil(next)}` : '—'} · {r.time}
                        </div>
                      </div>
                      <button onClick={() => {
                        if (r.linkedHabitId) {
                          upsertEntry({
                            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
                            habitId: r.linkedHabitId,
                            date: dayKey(new Date()),
                            value: true,
                            createdAt: new Date().toISOString(),
                          } as any);
                        }
                        if (r.repeat === 'none') updateReminder(r.id, { done: true });
                      }} className="text-text-muted hover:text-accent" title="Done"><Check size={15} /></button>
                      <button onClick={() => deleteReminder(r.id)} className="text-text-muted hover:text-danger" title="Remove"><Trash2 size={15} /></button>
                    </div>
                  );
                })}
                <button onClick={() => { setBellOpen(false); navigate('/calendar'); }} className="w-full text-center text-xs text-accent mt-1 py-1 hover:underline">Open calendar →</button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </div>
    </header>
  );
};