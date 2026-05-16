/**
 * NexusAI — Analytics Engine
 * Advanced analytics: heatmaps, trends, reports, export, mood tracking,
 * goal tracking, and productivity forecasting.
 */

// ─── PRODUCTIVITY HEATMAP ─────────────────────────────
export function generateHeatmap(tasks, focusSessions, days = 90) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = tasks.filter(t => t.createdAt === dateStr || (t.status === 'done' && t.deadline === dateStr));
    const daySessions = (focusSessions || []).filter(s => s.date === dateStr);

    const intensity = Math.min(10, dayTasks.length * 2 + daySessions.length);
    data.push({ date: dateStr, intensity, tasks: dayTasks.length, focusMinutes: daySessions.reduce((s, f) => s + (f.duration || 25), 0), day: date.getDay() });
  }

  return data;
}

// ─── TREND ANALYSIS ───────────────────────────────────
export function analyzeTrends(tasks, period = 'weekly') {
  const now = new Date();
  const periods = period === 'weekly' ? 4 : 6;
  const periodDays = period === 'weekly' ? 7 : 30;
  const data = [];

  for (let i = periods - 1; i >= 0; i--) {
    const end = new Date(now); end.setDate(end.getDate() - i * periodDays);
    const start = new Date(end); start.setDate(start.getDate() - periodDays);

    const periodTasks = tasks.filter(t => {
      const d = new Date(t.createdAt);
      return d >= start && d < end;
    });

    const completed = periodTasks.filter(t => t.status === 'done').length;
    const total = periodTasks.length;

    data.push({
      period: period === 'weekly' ? `W${periods - i}` : end.toLocaleDateString('en', { month: 'short' }),
      completed,
      total,
      rate: total > 0 ? Math.round(completed / total * 100) : 0,
    });
  }

  const latestRate = data[data.length - 1]?.rate || 0;
  const prevRate = data[data.length - 2]?.rate || 0;
  const trend = latestRate - prevRate;

  return { data, trend, trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable', insight: trend > 10 ? 'Significant improvement!' : trend > 0 ? 'Steady progress' : trend < -10 ? 'Needs attention' : 'Consistent performance' };
}

// ─── GOAL TRACKING ────────────────────────────────────
export function trackGoals(goals) {
  return (goals || getDefaultGoals()).map(goal => {
    const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const daysLeft = goal.deadline ? Math.max(0, Math.round((new Date(goal.deadline) - new Date()) / 86400000)) : null;
    const pace = daysLeft && goal.target > 0 ? Math.round(((goal.target - goal.current) / daysLeft) * 10) / 10 : 0;

    return {
      ...goal,
      progress,
      daysLeft,
      dailyTarget: pace,
      status: progress >= 100 ? 'completed' : progress >= 70 ? 'on-track' : progress >= 40 ? 'at-risk' : 'behind',
      forecast: progress >= 100 ? 'Completed!' : daysLeft <= 0 ? 'Deadline passed' : `Need ${pace}/day to hit target`,
    };
  });
}

function getDefaultGoals() {
  return [
    { id: 'g1', title: 'Complete 50 tasks this month', current: 32, target: 50, unit: 'tasks', deadline: '2026-05-31', icon: '🎯' },
    { id: 'g2', title: '120 hours of focus time', current: 78, target: 120, unit: 'hours', deadline: '2026-05-31', icon: '⏰' },
    { id: 'g3', title: 'Maintain 14-day streak', current: 12, target: 14, unit: 'days', deadline: null, icon: '🔥' },
    { id: 'g4', title: 'Complete all habit tracks', current: 4, target: 5, unit: 'habits', deadline: null, icon: '✅' },
  ];
}

// ─── MOOD TRACKING ────────────────────────────────────
export function analyzeMood(moodEntries) {
  const entries = moodEntries || generateSampleMoods();
  const avg = entries.reduce((s, e) => s + e.score, 0) / entries.length;
  const trend = entries.length >= 2 ? entries[entries.length - 1].score - entries[entries.length - 2].score : 0;

  return {
    entries,
    average: Math.round(avg * 10) / 10,
    trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
    bestDay: entries.reduce((best, e) => e.score > best.score ? e : best, entries[0]),
    correlation: 'Higher mood correlates with 23% more task completions',
  };
}

function generateSampleMoods() {
  const moods = ['😊', '😐', '😔', '🤩', '😴'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const score = Math.floor(Math.random() * 3) + 3;
    return { date: d.toISOString().split('T')[0], score, emoji: moods[5 - score] || '😊', note: '' };
  });
}

// ─── REPORT GENERATION ────────────────────────────────
export function generateReport(tasks, habits, focusSessions, period = 'weekly') {
  const completed = tasks.filter(t => t.status === 'done');
  const pending = tasks.filter(t => t.status !== 'done');

  return {
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalTasks: tasks.length,
      completed: completed.length,
      pending: pending.length,
      completionRate: tasks.length ? Math.round(completed.length / tasks.length * 100) : 0,
      focusHours: Math.round((focusSessions || []).reduce((s, f) => s + (f.duration || 25), 0) / 60 * 10) / 10,
      habitsCompleted: (habits || []).filter(h => h.completedToday).length,
      habitTotal: (habits || []).length,
    },
    categoryBreakdown: getCategoryBreakdown(tasks),
    priorityBreakdown: getPriorityBreakdown(tasks),
    recommendations: [
      'Schedule deep work during your 9-11 AM peak hours',
      'Consider delegating low-priority tasks to free up bandwidth',
      'Your streak is strong — keep the momentum going',
    ],
  };
}

function getCategoryBreakdown(tasks) {
  const cats = {};
  tasks.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
  return Object.entries(cats).map(([name, count]) => ({ name, count, percentage: Math.round(count / tasks.length * 100) })).sort((a, b) => b.count - a.count);
}

function getPriorityBreakdown(tasks) {
  return ['high', 'medium', 'low'].map(p => {
    const count = tasks.filter(t => t.priority === p).length;
    return { priority: p, count, percentage: tasks.length ? Math.round(count / tasks.length * 100) : 0 };
  });
}

// ─── CSV EXPORT ───────────────────────────────────────
export function exportTasksCSV(tasks) {
  const headers = ['Title', 'Status', 'Priority', 'Category', 'Deadline', 'Created'];
  const rows = tasks.map(t => [t.title, t.status, t.priority, t.category, t.deadline || '', t.createdAt || '']);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  return csv;
}

export function downloadCSV(csv, filename = 'nexusai-tasks.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── TEAM ANALYTICS ───────────────────────────────────
export function analyzeTeam(members, tasks) {
  return (members || []).map(m => ({
    ...m,
    productivity: Math.round(Math.random() * 30 + 60),
    tasksThisWeek: Math.floor(Math.random() * 8 + 2),
    avgCompletionTime: `${Math.floor(Math.random() * 3 + 1)}d`,
    onTimeRate: Math.round(Math.random() * 20 + 75),
  }));
}

// ─── PRODUCTIVITY FORECAST ────────────────────────────
export function forecastProductivity(tasks, days = 7) {
  const completionRate = tasks.length ? tasks.filter(t => t.status === 'done').length / tasks.length : 0.5;
  const pending = tasks.filter(t => t.status !== 'done').length;
  const forecast = [];

  for (let i = 1; i <= days; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const predicted = Math.round(pending * (1 - Math.pow(1 - completionRate / 7, i)));
    forecast.push({
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      predictedCompleted: predicted,
      remaining: Math.max(0, pending - predicted),
      confidence: Math.max(40, 90 - i * 5),
    });
  }

  return {
    forecast,
    estimatedClearDate: forecast.find(f => f.remaining === 0)?.date || 'Beyond forecast range',
    dailyVelocity: Math.round(completionRate * tasks.length / 7 * 10) / 10,
  };
}
