

export const BADGES: { id: string; name: string; description: string; icon: string; condition: (s: any) => boolean }[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first habit', icon: '🌱', condition: (s) => s.totalCompletions >= 1 },
  { id: 'ten', name: 'Getting Going', description: '10 completions', icon: '🌿', condition: (s) => s.totalCompletions >= 10 },
  { id: 'fifty', name: 'Consistent', description: '50 completions', icon: '🌳', condition: (s) => s.totalCompletions >= 50 },
  { id: 'hundred', name: 'Centurion', description: '100 completions', icon: '🏆', condition: (s) => s.totalCompletions >= 100 },
  { id: 'streak3', name: 'On a Roll', description: '3-day streak', icon: '🔥', condition: (s) => s.longestStreak >= 3 },
  { id: 'streak7', name: 'Week Warrior', description: '7-day streak', icon: '⚡', condition: (s) => s.longestStreak >= 7 },
  { id: 'streak30', name: 'Monthly Master', description: '30-day streak', icon: '👑', condition: (s) => s.longestStreak >= 30 },
  { id: 'streak100', name: 'Legendary', description: '100-day streak', icon: '💎', condition: (s) => s.longestStreak >= 100 },
  { id: 'level5', name: 'Level 5', description: 'Reach level 5', icon: '⭐', condition: (s) => s.level >= 5 },
  { id: 'level10', name: 'Level 10', description: 'Reach level 10', icon: '🌟', condition: (s) => s.level >= 10 },
  { id: 'designer', name: 'Designer Eye', description: 'Complete 5 design habits', icon: '🎨', condition: (s) => (s.designCompletions || 0) >= 5 },
  { id: 'focus', name: 'Deep Work', description: 'Complete a 25-min focus session', icon: '🎯', condition: (s) => (s.focusCount || 0) >= 1 },
  { id: 'ship', name: 'Ship It', description: 'Ship a portfolio item', icon: '🚀', condition: (s) => (s.shippedCount || 0) >= 1 },
];

export function evaluateBadges(stats: any): string[] {
  return BADGES.filter(b => b.condition(stats)).map(b => b.id);
}