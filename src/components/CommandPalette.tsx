import { useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Modal } from './ui/Modal';
import { buildExport, downloadJSON } from '../lib/export';
import { Search, Plus, Download, RotateCcw } from 'lucide-react';

export const CommandPalette = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const navigate = useNavigate();
  const resetAll = useStore(s => s.resetAll);
  const [q, setQ] = useState('');

  const go = (path: string) => { navigate(path); onOpenChange(false); };

  const handleExport = () => {
    const s = useStore.getState();
    downloadJSON(buildExport(s));
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Command palette" className="max-w-xl">
      <Command className="w-full" shouldFilter>
        <div className="flex items-center gap-2 border border-border rounded-xl px-3 mb-3">
          <Search size={16} className="text-text-muted" />
          <Command.Input value={q} onValueChange={setQ} placeholder="Type a command..." className="flex-1 h-10 bg-transparent outline-none text-sm" />
        </div>
        <Command.List className="max-h-72 overflow-auto">
          <Command.Empty className="py-6 text-center text-sm text-text-muted">No results.</Command.Empty>
          <Command.Group heading="Navigate" className="text-xs text-text-muted px-2 py-1">
            {[
              ['/', 'Dashboard'], ['/habits', 'Habits'], ['/study', 'Study'], ['/reading', 'Reading'],
              ['/skills', 'Skills'], ['/projects', 'Projects'], ['/calendar', 'Calendar'], ['/stats', 'Stats'],
              ['/focus', 'Focus'], ['/inspiration', 'Inspiration'], ['/portfolio', 'Portfolio'],
              ['/journal', 'Journal'], ['/wellness', 'Wellness'], ['/challenges', 'Challenges'],
              ['/goals', 'Goals'], ['/quit', 'Quit habits'], ['/finance', 'Finance'], ['/nutrition', 'Nutrition'],
              ['/meditation', 'Meditation'], ['/planner', 'Planner'], ['/palette', 'Palette lab'], ['/quit', 'Quit habits'],
              ['/review', 'Review'], ['/settings', 'Settings'],
            ].map(([p, l]) => (
              <Command.Item key={p} onSelect={() => go(p)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-surface-2 aria-selected:bg-surface-2 text-sm">
                <span>{l}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Actions" className="text-xs text-text-muted px-2 py-1">
            <Command.Item onSelect={() => go('/habits')} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-surface-2 aria-selected:bg-surface-2 text-sm">
              <Plus size={14} /> Add habit
            </Command.Item>
            <Command.Item onSelect={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-surface-2 aria-selected:bg-surface-2 text-sm">
              <Download size={14} /> Export data
            </Command.Item>
            <Command.Item onSelect={() => { if (confirm('Reset all data?')) { resetAll(); onOpenChange(false); } }} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-surface-2 aria-selected:bg-surface-2 text-sm text-danger">
              <RotateCcw size={14} /> Reset all data
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Modal>
  );
};