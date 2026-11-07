import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Timer, BarChart3, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: ListChecks, label: 'Habits' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/settings', icon: Settings, label: 'More' },
];

export const MobileNav = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex justify-around py-1.5" style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}>
    {items.map(it => (
      <NavLink key={it.to} to={it.to} end={it.to === '/'} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 text-[10px] px-2 min-w-[60px] min-h-[44px] justify-center', isActive ? 'text-accent' : 'text-text-muted')}>
        <it.icon size={20} />
        {it.label}
      </NavLink>
    ))}
  </nav>
);