import type { Template } from '../types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'designer-starter',
    name: 'Designer Starter',
    description: 'Daily habits for a productive designer',
    habits: [
      { name: 'Sketch 10 min', description: 'Quick ideation sketching', icon: '✏️', color: '#0f766e', type: 'duration', category: 'design', frequency: 'daily', target: 10, unit: 'min',  daysOfWeek: [1,2,3,4,5], checklistItems: [] },
      { name: 'Ship something', description: 'Post or share one piece', icon: '🚀', color: '#7c3aed', type: 'boolean', category: 'design', frequency: 'daily',  daysOfWeek: [1,2,3,4,5], checklistItems: [] },
      { name: 'Study a design', description: 'Deconstruct one great design', icon: '🔍', color: '#2563eb', type: 'boolean', category: 'learning', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Read 20 min', description: 'Design/tech reading', icon: '📚', color: '#d97706', type: 'duration', category: 'learning', frequency: 'daily', target: 20, unit: 'min',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Exercise', description: 'Move your body', icon: '🏃', color: '#16a34a', type: 'boolean', category: 'health', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Sleep 7h+', description: 'Quality rest', icon: '😴', color: '#6366f1', type: 'boolean', category: 'health', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
    ],
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Just 3 core habits',
    habits: [
      { name: 'Deep work 60 min', icon: '🎯', color: '#0f766e', type: 'duration', category: 'productivity', frequency: 'daily', target: 60, unit: 'min',  daysOfWeek: [1,2,3,4,5], checklistItems: [] },
      { name: 'Walk 20 min', icon: '🚶', color: '#16a34a', type: 'duration', category: 'health', frequency: 'daily', target: 20, unit: 'min',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Journal', icon: '📝', color: '#d97706', type: 'boolean', category: 'mind', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
    ],
  },
  {
    id: 'wellness',
    name: 'Wellness',
    description: 'Health & mindfulness focus',
    habits: [
      { name: 'Meditate', icon: '🧘', color: '#7c3aed', type: 'duration', category: 'mind', frequency: 'daily', target: 10, unit: 'min',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Drink 8 glasses water', icon: '💧', color: '#2563eb', type: 'numeric', category: 'health', frequency: 'daily', target: 8, unit: 'glasses',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'No screens before bed', icon: '🌙', color: '#6366f1', type: 'boolean', category: 'health', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: [] },
      { name: 'Gratitude (3 things)', icon: '🙏', color: '#d97706', type: 'checklist', category: 'mind', frequency: 'daily',  daysOfWeek: [1,2,3,4,5,6,0], checklistItems: ['Thing 1', 'Thing 2', 'Thing 3'] },
    ],
  },
];