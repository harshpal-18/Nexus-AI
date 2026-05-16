/**
 * NexusAI — Search & Filter Engine
 * Global search, natural language search, smart filtering,
 * saved presets, and advanced sorting.
 */

// ─── GLOBAL SEARCH ────────────────────────────────────
export function globalSearch(query, { tasks = [], events = [], habits = [], teamMembers = [] }) {
  if (!query?.trim()) return { results: [], total: 0 };
  const q = query.toLowerCase().trim();
  const results = [];

  // Search tasks
  tasks.forEach(task => {
    const score = calculateRelevance(q, [task.title, task.description, task.category, ...(task.tags || [])]);
    if (score > 0) results.push({ type: 'task', item: task, score, label: task.title, subtitle: `${task.category} · ${task.status}`, icon: '📋' });
  });

  // Search events
  events.forEach(event => {
    const score = calculateRelevance(q, [event.title, event.type || '']);
    if (score > 0) results.push({ type: 'event', item: event, score, label: event.title, subtitle: `${event.date} · ${event.time}`, icon: '📅' });
  });

  // Search habits
  habits.forEach(habit => {
    const score = calculateRelevance(q, [habit.title]);
    if (score > 0) results.push({ type: 'habit', item: habit, score, label: habit.title, subtitle: `${habit.streak} day streak`, icon: habit.icon || '✅' });
  });

  // Search team
  teamMembers.forEach(member => {
    const score = calculateRelevance(q, [member.name, member.role]);
    if (score > 0) results.push({ type: 'member', item: member, score, label: member.name, subtitle: member.role, icon: member.avatar || '👤' });
  });

  // Natural language intent detection
  const intent = detectSearchIntent(q);
  if (intent) results.unshift({ type: 'intent', item: intent, score: 100, label: intent.label, subtitle: intent.description, icon: '✨' });

  return { results: results.sort((a, b) => b.score - a.score).slice(0, 20), total: results.length };
}

function calculateRelevance(query, fields) {
  let score = 0;
  const words = query.split(/\s+/);

  fields.filter(Boolean).forEach(field => {
    const lower = field.toLowerCase();
    if (lower === query) score += 100;
    else if (lower.includes(query)) score += 60;
    else words.forEach(w => { if (lower.includes(w)) score += 30; });
  });

  return score;
}

function detectSearchIntent(query) {
  const intents = [
    { patterns: ['overdue', 'late', 'past due'], label: 'Show Overdue Tasks', description: 'Filter tasks past their deadline', filter: { type: 'tasks', status: 'overdue' } },
    { patterns: ['today', "today's", 'due today'], label: "Today's Tasks", description: 'Tasks due today', filter: { type: 'tasks', deadline: 'today' } },
    { patterns: ['high priority', 'urgent', 'critical'], label: 'High Priority', description: 'High-priority tasks', filter: { type: 'tasks', priority: 'high' } },
    { patterns: ['completed', 'done', 'finished'], label: 'Completed Tasks', description: 'All completed tasks', filter: { type: 'tasks', status: 'done' } },
    { patterns: ['this week', 'weekly'], label: 'This Week', description: "This week's tasks", filter: { type: 'tasks', timeframe: 'week' } },
    { patterns: ['schedule', 'calendar', 'meetings'], label: 'View Schedule', description: 'Upcoming events and meetings', filter: { type: 'events' } },
    { patterns: ['team', 'members', 'people'], label: 'Team Members', description: 'View team roster', filter: { type: 'team' } },
  ];

  for (const intent of intents) {
    if (intent.patterns.some(p => query.includes(p))) return intent;
  }
  return null;
}

// ─── ADVANCED FILTERING ──────────────────────────────
export function filterTasks(tasks, filters) {
  let result = [...tasks];

  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'overdue') result = result.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
    else result = result.filter(t => t.status === filters.status);
  }

  if (filters.priority && filters.priority !== 'all') result = result.filter(t => t.priority === filters.priority);
  if (filters.category && filters.category !== 'all') result = result.filter(t => t.category === filters.category);

  if (filters.deadline) {
    const now = new Date();
    if (filters.deadline === 'today') result = result.filter(t => t.deadline === now.toISOString().split('T')[0]);
    if (filters.deadline === 'week') {
      const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
      result = result.filter(t => t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= weekEnd);
    }
    if (filters.deadline === 'overdue') result = result.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done');
  }

  if (filters.tags?.length) result = result.filter(t => filters.tags.some(tag => t.tags?.includes(tag)));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }

  // Sorting
  if (filters.sort) {
    const sorts = {
      'deadline-asc': (a, b) => (a.deadline || 'z').localeCompare(b.deadline || 'z'),
      'deadline-desc': (a, b) => (b.deadline || '').localeCompare(a.deadline || ''),
      'priority-high': (a, b) => { const p = { high: 0, medium: 1, low: 2 }; return (p[a.priority] || 1) - (p[b.priority] || 1); },
      'created-newest': (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      'title-az': (a, b) => a.title.localeCompare(b.title),
    };
    if (sorts[filters.sort]) result.sort(sorts[filters.sort]);
  }

  return result;
}

// ─── SAVED FILTER PRESETS ─────────────────────────────
export const filterPresets = [
  { id: 'fp-1', name: 'My Focus', icon: '🎯', filters: { status: 'in-progress', priority: 'high', sort: 'deadline-asc' } },
  { id: 'fp-2', name: 'Overdue', icon: '⏰', filters: { status: 'overdue', sort: 'deadline-asc' } },
  { id: 'fp-3', name: 'Quick Wins', icon: '⚡', filters: { priority: 'low', status: 'todo', sort: 'created-newest' } },
  { id: 'fp-4', name: 'This Week', icon: '📅', filters: { deadline: 'week', sort: 'deadline-asc' } },
  { id: 'fp-5', name: 'Recently Added', icon: '🆕', filters: { sort: 'created-newest' } },
];
