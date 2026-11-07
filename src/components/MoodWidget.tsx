import { useState } from 'react';
import { useStore } from '../store/useStore';
import { todayStr } from '../lib/dates';
import { uid } from '../lib/id';
import { Smile, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY = ['🪫', '🔋', '⚡', '🚀', '🔥'];

export const MoodWidget = () => {
  const moods = useStore(s => s.moods);
  const upsertMood = useStore(s => s.upsertMood);
  const today = todayStr();
  const existing = moods.find(m => m.date === today);
  const [mood, setMood] = useState(existing?.mood || 3);
  const [energy, setEnergy] = useState(existing?.energy || 3);
  const [note, setNote] = useState(existing?.note || '');

  const save = () => {
    upsertMood({ id: existing?.id || uid(), date: today, mood, energy, note, createdAt: existing?.createdAt || new Date().toISOString() });
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Mood & energy</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-text-muted mb-1.5 flex items-center gap-1"><Smile size={12} /> Mood</div>
          <div className="flex gap-1">
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i + 1)} className={`flex-1 h-9 rounded-lg text-lg transition-all ${mood === i + 1 ? 'bg-accent-soft scale-110' : 'hover:bg-surface-2'}`}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1.5 flex items-center gap-1"><Zap size={12} /> Energy</div>
          <div className="flex gap-1">
            {ENERGY.map((m, i) => (
              <button key={i} onClick={() => setEnergy(i + 1)} className={`flex-1 h-9 rounded-lg text-lg transition-all ${energy === i + 1 ? 'bg-accent-soft scale-110' : 'hover:bg-surface-2'}`}>{m}</button>
            ))}
          </div>
        </div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Quick note..." className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm" />
        <Button size="sm" className="w-full" onClick={save}>{existing ? 'Update' : 'Save'} mood</Button>
      </CardContent>
    </Card>
  );
};