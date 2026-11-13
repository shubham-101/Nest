import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { brainAnswer, weeklySummary } from '../lib/ai';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea, Input } from '../components/ui/Input';
import { Sparkles, Send, Trash2, TrendingUp } from 'lucide-react';
import type { CoachMessage } from '../lib/ai';

const SUGGESTIONS = [
  'My weekly summary',
  'Why do I slip?',
  "What's my plan for tomorrow?",
  'How is my mood & sleep?',
  'My goals',
  'My summary',
  'How are my streaks?',
  'Give me advice',
];

export default function Coach() {
  const habits = useStore(s => s.habits);
  const entries = useStore(s => s.entries);
  const moods = useStore(s => s.moods);
  const sleepLogs = useStore(s => s.sleepLogs);
  const goals = useStore(s => s.goals);
  const [messages, setMessages] = useState<CoachMessage[]>([
    { role: 'assistant', text: "Hey — I'm your local Nest coach. I read your real data; nothing leaves your device. Ask me about streaks, why you slip, mood, sleep, goals — or tap a suggestion.", ts: new Date().toISOString() },
  ]);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [journal, setJournal] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const ws = weeklySummary(habits, entries);
  const recentMoods = moods.slice(-7);

  const ctx = {
    habits, entries,
    moods: moods.map(m => ({ date: m.date, mood: m.mood, energy: m.energy, note: m.note })),
    sleep: sleepLogs.map(s => ({ date: s.date, bedtime: s.bedtime, wakeTime: s.wakeTime, quality: s.quality })),
    goals: goals.map(g => ({ title: g.title, current: g.current, target: g.target, unit: g.unit, deadline: g.deadline, completed: g.completed })),
  };

  const send = (q: string) => {
    const text = q.trim();
    if (!text || chatLoading) return;
    setMessages(m => [...m, { role: 'user', text, ts: new Date().toISOString() }]);
    setQuestion('');
    setChatLoading(true);
    // simulate thinking latency for a natural feel
    setTimeout(() => {
      const reply = brainAnswer(text, ctx);
      setMessages(m => [...m, { role: 'assistant', text: reply, ts: new Date().toISOString() }]);
      setChatLoading(false);
    }, 250);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Nest Coach</h1>
        <div className="text-xs px-2 py-1 rounded-full bg-accent-soft text-accent border border-accent/20">On-device · your data never leaves this app</div>
      </div>

      {/* weekly summary strip */}
      <Card>
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0"><TrendingUp size={18} /></div>
          <p className="text-sm text-text-muted flex-1 min-w-[200px]">{ws}</p>
          <div className="flex gap-4 text-xs text-text-muted">
            <div>Mood <b className="text-text">{recentMoods.length ? (recentMoods.reduce((a, m) => a + m.mood, 0) / recentMoods.length).toFixed(1) : '—'}</b></div>
            <div>Energy <b className="text-text">{recentMoods.length ? (recentMoods.reduce((a, m) => a + m.energy, 0) / recentMoods.length).toFixed(1) : '—'}</b></div>
          </div>
        </CardContent>
      </Card>

      {/* chat */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-accent" /> Chat with Nest</CardTitle>
          <button onClick={() => setMessages(messages.slice(0, 1))} className="text-xs text-text-muted hover:text-danger flex items-center gap-1"><Trash2 size={12} /> Clear</button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={scrollRef} className="h-72 overflow-y-auto space-y-3 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line leading-relaxed ${
                  msg.role === 'user' ? 'bg-accent text-white rounded-br-md' : 'bg-surface-2 text-text rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && <div className="text-xs text-text-muted pl-2">Nest is thinking…</div>}
          </div>

          {/* suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-surface-2 hover:bg-accent-soft text-text-muted hover:text-accent transition">{s}</button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); send(question); }} className="flex gap-2">
            <Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask anything… e.g. why do I slip?" className="h-11" />
            <Button type="submit" size="lg" disabled={chatLoading || !question.trim()}><Send size={16} /></Button>
          </form>
        </CardContent>
      </Card>

      {/* reflection journal */}
      <Card>
        <CardHeader><CardTitle className="text-base">Reflection journal</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={journal} onChange={e => setJournal(e.target.value)} rows={5} placeholder="What went well? What to improve? What to ship next week?" />
          <Button onClick={() => send(`Journal reflection: ${journal}`)}>
            <Sparkles size={16} /> Get coach take on my journal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}