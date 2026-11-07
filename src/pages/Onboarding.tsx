import { useState } from 'react';
import { useStore } from '../store/useStore';
import { DEFAULT_TEMPLATES } from '../lib/templates';
import { uid } from '../lib/id';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Onboarding() {
  const updateSettings = useStore(s => s.updateSettings);
  const addHabit = useStore(s => s.addHabit);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('designer-starter');

  const finish = () => {
    const tpl = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      tpl.habits.forEach((h, i) => {
        addHabit({ ...h, id: uid(), createdAt: new Date().toISOString(), order: i, archived: false, checklistItems: h.checklistItems || [] } as any);
      });
    }
    updateSettings({ name: name.trim() || 'Designer', onboardingDone: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-2xl">
        {step === 0 && (
          <Card className="p-10 text-center">
            <div className="mx-auto mb-6 w-16 h-16"><Logo size={64} /></div>
            <h1 className="font-display text-4xl mb-3">Welcome to Nest</h1>
            <p className="text-text-muted mb-8 max-w-md mx-auto">A calm, beautiful habit tracker built for designers and creatives. Track habits, focus deeply, capture inspiration, and ship work.</p>
            <Button size="lg" onClick={() => setStep(1)}>Get started <ArrowRight size={18} /></Button>
          </Card>
        )}
        {step === 1 && (
          <Card className="p-10">
            <h2 className="font-display text-2xl mb-2">What should we call you?</h2>
            <p className="text-text-muted mb-6">Personalize your experience.</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-lg mb-6 focus:outline-none focus:ring-2 focus:ring-accent/40" autoFocus />
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></Button>
            </div>
          </Card>
        )}
        {step === 2 && (
          <Card className="p-10">
            <h2 className="font-display text-2xl mb-2">Choose a starter template</h2>
            <p className="text-text-muted mb-6">You can customize everything later.</p>
            <div className="grid gap-3 mb-6">
              {DEFAULT_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplateId(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${templateId === t.id ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent/50'}`}>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-text-muted">{t.description} · {t.habits.length} habits</div>
                </button>
              ))}
              <button onClick={() => setTemplateId('none')} className={`text-left p-4 rounded-xl border transition-all ${templateId === 'none' ? 'border-accent bg-accent-soft' : 'border-border hover:border-accent/50'}`}>
                <div className="font-medium">Start empty</div>
                <div className="text-sm text-text-muted">I'll add my own habits</div>
              </button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(3)}>Continue <ArrowRight size={18} /></Button>
            </div>
          </Card>
        )}
        {step === 3 && (
          <Card className="p-10 text-center">
            <div className="h-16 w-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto mb-6">
              <Check size={32} />
            </div>
            <h2 className="font-display text-3xl mb-3">You're all set{ name ? `, ${name}` : '' }!</h2>
            <p className="text-text-muted mb-8">Let's build great habits together.</p>
            <Button size="lg" onClick={finish}>Enter Nest <Sparkles size={18} /></Button>
          </Card>
        )}
      </div>
    </div>
  );
}