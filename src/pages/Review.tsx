import { useState } from 'react';
import { useStore } from '../store/useStore';
import { weeklySummary } from '../lib/ai';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Sparkles } from 'lucide-react';

export default function Review() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const moods = useStore(s => s.moods);
  const settings = useStore(s => s.settings);
  const [journal, setJournal] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [loading, setLoading] = useState(false);

  const ws = weeklySummary(habits, entries);
  const recentMoods = moods.slice(-7);

  const askCoach = async () => {
    setLoading(true);
    const { askAI } = await import('../lib/ai');
    const prompt = `I'm a designer tracking habits. Here's my weekly summary: ${ws}. My journal: ${journal}. Give me 3 actionable suggestions and encouragement in 2-3 sentences.`;
    const reply = await askAI(settings.aiProvider, settings.aiKey, prompt);
    setAiReply(reply);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl">Weekly review</h1>

      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent>
          <p className="text-text-muted">{ws}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-surface-2 rounded-xl p-3">
              <div className="text-xs text-text-muted">Avg mood (7d)</div>
              <div className="text-xl font-bold">
                {recentMoods.length ? (recentMoods.reduce((a, m) => a + m.mood, 0) / recentMoods.length).toFixed(1) : '—'}
              </div>
            </div>
            <div className="bg-surface-2 rounded-xl p-3">
              <div className="text-xs text-text-muted">Avg energy (7d)</div>
              <div className="text-xl font-bold">
                {recentMoods.length ? (recentMoods.reduce((a, m) => a + m.energy, 0) / recentMoods.length).toFixed(1) : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reflection journal</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={journal} onChange={e => setJournal(e.target.value)} rows={6} placeholder="What went well? What to improve? What to ship next week?" />
          <Button onClick={askCoach} disabled={loading}>
            <Sparkles size={16} /> {loading ? 'Thinking...' : 'Get AI coach feedback'}
          </Button>
          {aiReply && (
            <div className="bg-accent-soft/40 border border-accent/20 rounded-xl p-4 text-sm leading-relaxed">
              {aiReply}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}