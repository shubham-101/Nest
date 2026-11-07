import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Calendar, BarChart3, Timer, ImageIcon, Rocket, BookOpen, Settings, Command, GraduationCap, Book, Sparkles, FolderKanban, Notebook, Heart, Trophy, Target, Wallet, Apple, Wind, Clock, Palette, Ban, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useStore } from '../../store/useStore';
import { todayStr } from '../../lib/dates';
import { getActiveProfileId, getProfiles, ACTIVE_PROFILE_KEY } from '../../lib/profiles';
import { Logo } from '../Logo';

const groups = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/habits', icon: ListChecks, label: 'Habits' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
      { to: '/stats', icon: BarChart3, label: 'Stats' },
      { to: '/planner', icon: Clock, label: 'Planner' },
    ],
  },
  {
    items: [
      { to: '/study', icon: GraduationCap, label: 'Study' },
      { to: '/reading', icon: Book, label: 'Reading' },
      { to: '/skills', icon: Sparkles, label: 'Skills' },
      { to: '/focus', icon: Timer, label: 'Focus' },
    ],
  },
  {
    items: [
      { to: '/wellness', icon: Heart, label: 'Wellness' },
      { to: '/nutrition', icon: Apple, label: 'Nutrition' },
      { to: '/meditation', icon: Wind, label: 'Meditation' },
      { to: '/finance', icon: Wallet, label: 'Finance' },
      { to: '/journal', icon: Notebook, label: 'Journal' },
    ],
  },
  {
    items: [
      { to: '/inspiration', icon: ImageIcon, label: 'Inspiration' },
      { to: '/portfolio', icon: Rocket, label: 'Portfolio' },
      { to: '/projects', icon: FolderKanban, label: 'Projects' },
      { to: '/goals', icon: Target, label: 'Goals' },
      { to: '/challenges', icon: Trophy, label: 'Challenges' },
      { to: '/quit', icon: Ban, label: 'Quit habits' },
      { to: '/review', icon: BookOpen, label: 'Review' },
      { to: '/palette', icon: Palette, label: 'Palette lab' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const COLLAPSED_KEY = 'studio-sidebar-collapsed';

export const Sidebar = ({ onCommand }: { onCommand: () => void }) => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1');
  const profiles = getProfiles();
  const activeProfile = profiles.find(p => p.id === getActiveProfileId());
  const moods = useStore(s => s.moods);
  const today = todayStr();
  const m = moods.find(x => x.date === today);
  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
  const ENERGY = ['🪫', '🔋', '⚡', '🚀', '🔥'];

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 m-3 my-3 rounded-3xl border border-border bg-surface shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] h-[calc(100vh-24px)] sticky top-3 transition-all duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-20' : 'w-60'
      )}
    >
      {/* header */}
      <div className={cn('py-5 flex items-center gap-2.5', collapsed ? 'px-3 justify-center' : 'px-5')}>
        <Logo size={36} />
        {!collapsed && (
          <div className="flex-1">
            <div className="font-display text-lg leading-none">Nest</div>
            <div className="text-[11px] text-text-muted">Designer tracker</div>
          </div>
        )}
        {!collapsed && m && (
          <div className="flex items-center gap-1 text-lg" title={`Mood ${m.mood} · Energy ${m.energy}`}>
            <span>{MOODS[m.mood - 1]}</span>
            <span>{ENERGY[m.energy - 1]}</span>
          </div>
        )}
      </div>

      {/* nav */}
      <nav className={cn('flex-1 space-y-3 sidebar-scroll pr-0', collapsed ? 'px-2.5 overflow-y-auto' : 'px-3 overflow-y-auto')}>
        {groups.map((g, gi) => (
          <div key={gi} className={cn('space-y-0.5', !collapsed && 'rounded-2xl bg-surface-2/60 p-1.5')}>
            {g.items.map(item => (
              <div key={item.to} className="group relative">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group/item',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-accent text-white font-medium shadow shadow-accent/30'
                      : 'text-text-muted hover:text-text hover:bg-surface-2'
                  )}
                >
                  <item.icon size={18} className="shrink-0 transition-transform duration-200 ease-out group-hover/item:scale-125 group-hover/item:rotate-[-6deg]" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
                {collapsed && (
                  <span className="absolute left-[72px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 text-xs font-medium bg-text text-bg rounded-full shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap translate-x-1 group-hover:translate-x-0">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* footer */}
      <div className={cn('p-3 space-y-2', collapsed && 'flex flex-col items-center')}>
        {/* collapse */}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors',
            collapsed && 'justify-center w-10 h-10 p-0'
          )}
        >
          {collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={16} /> <span className="text-xs">Collapse Sidebar</span></>}
        </button>
        {/* profile */}
        {activeProfile && (
          <button
            onClick={() => { localStorage.removeItem(ACTIVE_PROFILE_KEY); window.location.reload(); }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-left hover:bg-surface-2 transition-colors m-1',
              collapsed && 'justify-center px-0'
            )}
            title="Switch profile"
          >
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: activeProfile.color }}>
              {activeProfile.name.trim().charAt(0).toUpperCase() || '?'}
            </div>
            {!collapsed && <span className="text-xs font-medium truncate">{activeProfile.name}</span>}
          </button>
        )}
        {/* command palette */}
        <button
          onClick={onCommand}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors',
            collapsed && 'justify-center w-10 h-10 p-0'
          )}
          title={collapsed ? 'Command palette' : undefined}
        >
          <Command size={16} className="shrink-0" />
          {!collapsed && <span className="text-xs">Command palette</span>}
        </button>
      </div>
    </aside>
  );
};