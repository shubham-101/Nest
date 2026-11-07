import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { buildExport, downloadJSON, buildSyncPackage, applySyncPackage } from '../lib/export';
import { getProfiles, getActiveProfileId, ACTIVE_PROFILE_KEY } from '../lib/profiles';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const settings = useStore(s => s.settings);
  const stats = useStore(s => s.stats);
  const updateSettings = useStore(s => s.updateSettings);
  const resetAll = useStore(s => s.resetAll);
  const importData = useStore(s => s.importData);
  const [importText, setImportText] = useState('');

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      importData(data);
      alert('Imported successfully.');
      setImportText('');
    } catch (e) {
      alert('Invalid JSON.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImportText(r.result as string);
    r.readAsText(f);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your name</Label>
            <Input value={settings.name} onChange={e => updateSettings({ name: e.target.value })} />
          </div>
          <div>
            <Label>Theme</Label>
            <Select value={settings.theme} onValueChange={v => updateSettings({ theme: v as any })} options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]} />
          </div>
          <div>
            <Label>Accent color</Label>
            <div className="flex flex-wrap gap-1.5">
              {['#0f766e','#7c3aed','#2563eb','#d97706','#16a34a','#dc2626','#db2777','#0891b2','#ea580c'].map(c => (
                <button key={c} onClick={() => updateSettings({ accentColor: c })} className={`h-8 w-8 rounded-full ${settings.accentColor === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Week starts on</Label>
            <Select value={String(settings.weekStartsOn)} onValueChange={v => updateSettings({ weekStartsOn: Number(v) as any })} options={[
              { value: '1', label: 'Monday' },
              { value: '0', label: 'Sunday' },
            ]} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.showXP} onChange={e => updateSettings({ showXP: e.target.checked })} />
            Show XP / level
          </label>
          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.notifications} onChange={async (e) => {
                if (e.target.checked && 'Notification' in window) {
                  const perm = await Notification.requestPermission();
                  if (perm !== 'granted') { alert('Notification permission denied.'); return; }
                }
                updateSettings({ notifications: e.target.checked });
              }} />
              Enable reminders
            </label>
            <p className="text-xs text-text-muted mt-1">Set a reminder time on each habit. Browser must stay open.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile & sync</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: getProfiles().find(p => p.id === getActiveProfileId())?.color || '#0f766e' }}>
              {(getProfiles().find(p => p.id === getActiveProfileId())?.name || 'M').trim().charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">{getProfiles().find(p => p.id === getActiveProfileId())?.name || 'Default'}</div>
              <div className="text-xs text-text-muted">{getProfiles().length} profile(s) installed on this device</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem(ACTIVE_PROFILE_KEY); window.location.reload(); }}>Switch profile</Button>
            <Button variant="outline" size="sm" onClick={() => downloadJSON(buildSyncPackage(), 'studio-sync.json')}><Download size={14} /> Export all profiles</Button>
            <Button variant="ghost" size="sm"><Upload size={14} /> Import sync file
              <input type="file" accept="application/json,.json" className="absolute opacity-0 inset-0 cursor-pointer" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => {
                  try {
                    const pkg = JSON.parse(r.result as string);
                    if (!pkg || typeof pkg !== 'object' || !pkg.data) throw new Error('bad');
                    applySyncPackage(pkg);
                    alert('Sync file imported. Reloading app…');
                    window.location.reload();
                  } catch { alert('That file is not a valid Nest sync file.'); }
                };
                r.readAsText(f);
              }} />
            </Button>
          </div>
          <p className="text-xs text-text-muted">Each profile's data is stored separately on this device. Send the sync file to another device and import it there to move your profiles.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>AI Coach</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Provider</Label>
            <Select value={settings.aiProvider} onValueChange={v => updateSettings({ aiProvider: v as any })} options={[
              { value: 'none', label: 'None (local insights)' },
              { value: 'openai', label: 'OpenAI' },
              { value: 'anthropic', label: 'Anthropic' },
            ]} />
          </div>
          <div>
            <Label>API key</Label>
            <Input type="password" value={settings.aiKey} onChange={e => updateSettings({ aiKey: e.target.value })} placeholder="sk-..." />
          </div>
          <p className="text-xs text-text-muted">Keys are stored locally in your browser. Requests go directly to the provider.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => downloadJSON(buildExport(useStore.getState()))}>
            <Download size={14} /> Export backup (JSON)
          </Button>
          <div>
            <Label>Import backup (JSON)</Label>
            <div className="flex gap-2">
              <input type="file" accept="application/json" onChange={handleFileImport} className="text-sm" />
            </div>
            <Textarea value={importText} onChange={e => setImportText(e.target.value)} rows={4} placeholder="Paste JSON here..." className="mt-2" />
            <Button className="mt-2" onClick={handleImport}><Upload size={14} /> Import</Button>
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="danger" onClick={() => { if (confirm('Reset ALL data? This cannot be undone.')) resetAll(); }}>
              <Trash2 size={14} /> Reset all data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
        <CardContent className="text-sm text-text-muted space-y-1">
          <div>Level: {stats.level} · XP: {stats.xp}</div>
          <div>Badges: {stats.badges.length}</div>
          <div>Total completions: {stats.totalCompletions}</div>
        </CardContent>
      </Card>
    </div>
  );
}