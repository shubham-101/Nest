import { useState } from 'react';
import {
  getProfiles, setActiveProfileId, getActiveProfileId, createProfile, deleteProfile,
} from '../lib/profiles';
import { buildSyncPackage, applySyncPackage, downloadJSON } from '../lib/export';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Label } from '../components/ui/Input';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { Logo } from '../components/Logo';

const COLORS = ['#0f766e', '#7c3aed', '#2563eb', '#d97706', '#16a34a', '#dc2626', '#db2777'];

export default function ProfileSwitch({ onEnter }: { onEnter: () => void }) {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [importText, setImportText] = useState('');

  const enter = (id: string) => {
    setActiveProfileId(id);
    onEnter(); // will trigger reload in App
  };

  const create = () => {
    if (!name.trim()) return;
    const p = createProfile(name.trim(), color);
    setActiveProfileId(p.id);
    onEnter();
  };

  const handleSyncImport = () => {
    try {
      const pkg = JSON.parse(importText);
      if (!pkg || typeof pkg !== 'object') throw new Error('bad');
      applySyncPackage(pkg);
      setImportText('');
      alert('Sync imported. Reloading app…');
      window.location.reload();
    } catch {
      alert('Invalid sync file.');
    }
  };

  const handleSyncFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      } catch {
        alert('That file is not a valid Nest sync file.');
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16"><Logo size={64} /></div>
          <h1 className="font-display text-3xl">Nest</h1>
          <p className="text-text-muted text-sm mt-1">Choose a profile to continue</p>
        </div>

        <div className="space-y-2">
          {profiles.map(p => (
            <Card key={p.id} className="p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => enter(p.id)} className="flex-1 flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: p.color }}>
                    {p.name.trim().charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-text-muted">Profile {p.id === activeId && '· active'}</div>
                  </div>
                </button>
                {p.id !== 'default' && (
                  <button onClick={() => { if (confirm(`Delete profile "${p.name}" and its data?`)) { deleteProfile(p.id); window.location.reload(); } }} className="text-text-muted hover:text-danger" aria-label="delete profile">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 space-y-3">
          <div className="font-medium text-sm">New profile</div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`h-7 w-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-accent' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={create} disabled={!name.trim()}><Plus size={16} /> Create & enter</Button>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="font-medium text-sm">Sync between devices</div>
          <p className="text-xs text-text-muted">Export all profiles to a file, then import it on another device. Your data is stored locally — this is your sync.</p>
          <Button variant="outline" className="w-full" onClick={() => downloadJSON(buildSyncPackage(), 'studio-sync.json')}>
            <Download size={14} /> Export sync file (all profiles)
          </Button>
          <div>
            <Label>Import sync file</Label>
            <input type="file" accept="application/json,.json" onChange={handleSyncFile} className="text-sm text-text-muted" />
            <div className="flex items-center gap-2 my-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Input value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste JSON…" />
            <Button variant="ghost" className="w-full mt-2" onClick={handleSyncImport} disabled={!importText.trim()}>
              <Upload size={14} /> Import pasted JSON
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}