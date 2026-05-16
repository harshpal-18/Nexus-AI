/**
 * NexusAI — AI Productivity Engine
 * Intelligent algorithms for productivity coaching, burnout detection,
 * focus analysis, scheduling, and task prioritization.
 */

// ─── PRODUCTIVITY SCORING ─────────────────────────────
export function calculateProductivityScore(tasks, focusSessions, habits) {
  const taskScore = calculateTaskScore(tasks);
  const focusScore = calculateFocusScore(focusSessions);
  const habitScore = calculateHabitScore(habits);
  const consistencyScore = calculateConsistencyScore(tasks);

  const weights = { task: 0.35, focus: 0.25, habit: 0.2, consistency: 0.2 };
  const overall = Math.round(
    taskScore * weights.task +
    focusScore * weights.focus +
    habitScore * weights.habit +
    consistencyScore * weights.consistency
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    breakdown: { taskScore, focusScore, habitScore, consistencyScore },
    level: getProductivityLevel(overall),
    trend: calculateTrend(tasks),
  };
}

function calculateTaskScore(tasks) {
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length;
  const base = (done / tasks.length) * 100;
  const penalty = (overdue / tasks.length) * 20;
  return Math.max(0, Math.round(base - penalty));
}

function calculateFocusScore(sessions) {
  if (!sessions?.length) return 65;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 25), 0);
  const targetMinutes = 240; // 4h daily target
  return Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
}

function calculateHabitScore(habits) {
  if (!habits?.length) return 50;
  const completed = habits.filter(h => h.completedToday).length;
  return Math.round((completed / habits.length) * 100);
}

function calculateConsistencyScore(tasks) {
  const last7 = tasks.filter(t => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return (now - d) / 86400000 <= 7;
  });
  return last7.length > 0 ? Math.min(100, last7.length * 12) : 40;
}

function getProductivityLevel(score) {
  if (score >= 90) return { label: 'Elite', emoji: '🏆', color: '#FFD700' };
  if (score >= 75) return { label: 'High Performer', emoji: '🔥', color: '#22C55E' };
  if (score >= 60) return { label: 'On Track', emoji: '📈', color: '#2563EB' };
  if (score >= 40) return { label: 'Needs Focus', emoji: '⚡', color: '#F59E0B' };
  return { label: 'Getting Started', emoji: '🌱', color: '#EF4444' };
}

function calculateTrend(tasks) {
  const now = new Date();
  const thisWeek = tasks.filter(t => t.status === 'done' && (now - new Date(t.createdAt)) / 86400000 <= 7).length;
  const lastWeek = tasks.filter(t => t.status === 'done' && (now - new Date(t.createdAt)) / 86400000 > 7 && (now - new Date(t.createdAt)) / 86400000 <= 14).length;
  const diff = thisWeek - lastWeek;
  return { direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable', percentage: lastWeek > 0 ? Math.round((diff / lastWeek) * 100) : 0 };
}

// ─── BURNOUT DETECTION ────────────────────────────────
export function detectBurnout(tasks, focusSessions, habits) {
  const indicators = [];
  let riskScore = 0;

  // Check overwork
  const todayFocus = (focusSessions || []).filter(s => isToday(s.date)).reduce((sum, s) => sum + (s.duration || 25), 0);
  if (todayFocus > 480) { indicators.push({ type: 'overwork', message: 'Over 8 hours of focus today', severity: 'high' }); riskScore += 30; }
  else if (todayFocus > 360) { indicators.push({ type: 'overwork', message: 'Over 6 hours of focus today', severity: 'medium' }); riskScore += 15; }

  // Check task overload
  const pending = tasks.filter(t => t.status !== 'done');
  const highPriority = pending.filter(t => t.priority === 'high');
  if (highPriority.length >= 5) { indicators.push({ type: 'overload', message: `${highPriority.length} high-priority tasks pending`, severity: 'high' }); riskScore += 25; }
  if (pending.length > 15) { indicators.push({ type: 'overload', message: `${pending.length} tasks in backlog`, severity: 'medium' }); riskScore += 15; }

  // Check habit breaks
  const brokenStreaks = (habits || []).filter(h => !h.completedToday && h.streak > 5);
  if (brokenStreaks.length >= 2) { indicators.push({ type: 'habit_decline', message: 'Multiple habit streaks at risk', severity: 'medium' }); riskScore += 15; }

  // Check overdue tasks
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
  if (overdue.length >= 3) { indicators.push({ type: 'deadlines', message: `${overdue.length} overdue tasks`, severity: 'high' }); riskScore += 20; }

  const level = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'moderate' : 'low';

  return {
    riskScore: Math.min(100, riskScore),
    level,
    indicators,
    recommendation: getBurnoutRecommendation(level, indicators),
  };
}

function getBurnoutRecommendation(level, indicators) {
  if (level === 'high') return { title: 'Take a Break', message: 'Your burnout risk is high. Consider reducing your workload, delegating tasks, and taking regular breaks. Try a 15-minute walk.', action: 'Start Recovery Mode' };
  if (level === 'moderate') return { title: 'Watch Your Pace', message: 'You\'re pushing hard. Schedule some breaks and consider postponing non-critical tasks.', action: 'Optimize Schedule' };
  return { title: 'Looking Good', message: 'Your workload is balanced. Keep maintaining healthy work habits.', action: null };
}

// ─── FOCUS ANALYSIS ───────────────────────────────────
export function analyzeFocus(focusSessions, tasks) {
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, minutes: 0, sessions: 0 }));

  (focusSessions || []).forEach(s => {
    const h = s.startHour || Math.floor(Math.random() * 12) + 7;
    if (h < 24) { hourly[h].minutes += s.duration || 25; hourly[h].sessions++; }
  });

  // Simulated peak hours based on common patterns
  const peakHours = [
    { start: 9, end: 11, quality: 92, label: 'Morning Peak' },
    { start: 14, end: 16, quality: 78, label: 'Afternoon Window' },
  ];

  const avgSessionLength = focusSessions?.length
    ? Math.round(focusSessions.reduce((s, f) => s + (f.duration || 25), 0) / focusSessions.length)
    : 25;

  return {
    peakHours,
    hourlyDistribution: hourly,
    avgSessionLength,
    totalFocusToday: hourly.reduce((s, h) => s + h.minutes, 0),
    deepWorkRatio: Math.round(Math.random() * 20 + 60),
    distractionScore: Math.round(Math.random() * 20 + 10),
    recommendations: generateFocusRecommendations(peakHours, avgSessionLength),
  };
}

function generateFocusRecommendations(peaks, avgLength) {
  const recs = [];
  if (peaks[0]) recs.push({ type: 'schedule', message: `Schedule deep work during ${peaks[0].start}:00–${peaks[0].end}:00 (${peaks[0].quality}% focus quality)`, priority: 'high' });
  if (avgLength < 20) recs.push({ type: 'duration', message: 'Try extending sessions to 25+ minutes for deeper focus', priority: 'medium' });
  if (avgLength > 60) recs.push({ type: 'breaks', message: 'Take breaks every 50 minutes to maintain quality', priority: 'medium' });
  recs.push({ type: 'environment', message: 'Use ambient sounds during focus sessions to reduce distractions', priority: 'low' });
  return recs;
}

// ─── SMART TASK PRIORITIZATION ────────────────────────
export function prioritizeTasks(tasks) {
  return tasks
    .filter(t => t.status !== 'done')
    .map(task => ({
      ...task,
      aiScore: calculateTaskUrgency(task),
      aiReason: getTaskReason(task),
    }))
    .sort((a, b) => b.aiScore - a.aiScore);
}

function calculateTaskUrgency(task) {
  let score = 0;
  // Priority weight
  if (task.priority === 'high') score += 40;
  else if (task.priority === 'medium') score += 20;
  else score += 5;

  // Deadline proximity
  if (task.deadline) {
    const daysLeft = (new Date(task.deadline) - new Date()) / 86400000;
    if (daysLeft < 0) score += 50; // overdue
    else if (daysLeft < 1) score += 35;
    else if (daysLeft < 3) score += 20;
    else if (daysLeft < 7) score += 10;
  }

  // Status weight
  if (task.status === 'in-progress') score += 15;

  // Subtask completion
  if (task.subtasks?.length) {
    const pct = task.subtasks.filter(s => s.done).length / task.subtasks.length;
    if (pct > 0.5) score += 10; // nearly done, push to finish
  }

  return Math.min(100, score);
}

function getTaskReason(task) {
  if (task.deadline && new Date(task.deadline) < new Date()) return 'Overdue — needs immediate attention';
  if (task.deadline && (new Date(task.deadline) - new Date()) / 86400000 < 1) return 'Due today';
  if (task.priority === 'high' && task.status === 'in-progress') return 'High priority, already started';
  if (task.priority === 'high') return 'High priority task';
  if (task.subtasks?.length && task.subtasks.filter(s => s.done).length / task.subtasks.length > 0.5) return 'Almost complete — push to finish';
  return 'Scheduled based on priority and deadline';
}

// ─── AI DAILY SCHEDULE GENERATOR ──────────────────────
export function generateDailySchedule(tasks, events, focusAnalysis) {
  const schedule = [];
  const peakStart = focusAnalysis?.peakHours?.[0]?.start || 9;

  // Morning routine
  schedule.push({ time: '07:00', duration: 30, title: 'Morning Routine', type: 'routine', category: 'wellness' });
  schedule.push({ time: '07:30', duration: 15, title: 'Review Daily Plan', type: 'planning', category: 'productivity' });

  // Add existing events
  (events || []).forEach(e => {
    schedule.push({ time: e.time, duration: e.duration, title: e.title, type: 'event', category: 'meeting', color: e.color });
  });

  // Schedule high-priority tasks during peak hours
  const prioritized = prioritizeTasks(tasks).slice(0, 6);
  let currentHour = peakStart;

  prioritized.forEach((task, i) => {
    const estimatedDuration = estimateTaskDuration(task);
    const timeStr = `${String(currentHour).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;

    // Avoid event conflicts
    const conflict = schedule.find(s => s.time === timeStr);
    if (!conflict) {
      schedule.push({
        time: timeStr,
        duration: estimatedDuration,
        title: task.title,
        type: 'task',
        category: task.category,
        taskId: task.id,
        aiScore: task.aiScore,
        priority: task.priority,
      });
    }
    if (i % 2 === 1) currentHour++;
  });

  // Add breaks
  schedule.push({ time: '10:30', duration: 15, title: 'Break — Stretch & Water', type: 'break', category: 'wellness' });
  schedule.push({ time: '12:30', duration: 60, title: 'Lunch Break', type: 'break', category: 'wellness' });
  schedule.push({ time: '15:00', duration: 15, title: 'Afternoon Break', type: 'break', category: 'wellness' });
  schedule.push({ time: '17:30', duration: 15, title: 'Daily Review & Tomorrow Planning', type: 'planning', category: 'productivity' });

  return schedule.sort((a, b) => a.time.localeCompare(b.time));
}

// ─── TASK DURATION ESTIMATION ─────────────────────────
export function estimateTaskDuration(task) {
  let base = 30; // default 30 min
  // Category-based estimation
  const categoryTimes = { Development: 90, Design: 60, Content: 45, Research: 60, Marketing: 30, Management: 20 };
  base = categoryTimes[task.category] || 30;

  // Priority adjustment
  if (task.priority === 'high') base *= 1.2;
  if (task.priority === 'low') base *= 0.8;

  // Subtask complexity
  if (task.subtasks?.length > 3) base *= 1.3;

  return Math.round(base / 5) * 5; // round to nearest 5 min
}

// ─── PROCRASTINATION DETECTION ────────────────────────
export function detectProcrastination(tasks) {
  const signs = [];

  const pending = tasks.filter(t => t.status === 'todo');
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
  const stale = tasks.filter(t => t.status === 'todo' && t.createdAt && (new Date() - new Date(t.createdAt)) / 86400000 > 5);

  if (stale.length >= 3) signs.push({ type: 'stale_tasks', message: `${stale.length} tasks untouched for 5+ days`, severity: 'high', tasks: stale.map(t => t.title) });
  if (overdue.length >= 2) signs.push({ type: 'overdue', message: `${overdue.length} tasks past deadline`, severity: 'high' });
  if (pending.length > tasks.filter(t => t.status === 'done').length * 2) signs.push({ type: 'backlog', message: 'Backlog growing faster than completion', severity: 'medium' });

  const score = Math.min(100, signs.reduce((s, sign) => s + (sign.severity === 'high' ? 30 : 15), 0));

  return {
    score,
    level: score >= 50 ? 'high' : score >= 20 ? 'moderate' : 'low',
    signs,
    tips: getProcrastinationTips(signs),
  };
}

function getProcrastinationTips(signs) {
  const tips = [];
  if (signs.find(s => s.type === 'stale_tasks')) tips.push('Use the 2-minute rule: if it takes less than 2 minutes, do it now.');
  if (signs.find(s => s.type === 'overdue')) tips.push('Renegotiate deadlines for overdue tasks and create a catch-up plan.');
  if (signs.find(s => s.type === 'backlog')) tips.push('Stop adding new tasks until you clear at least 3 pending ones.');
  tips.push('Break large tasks into smaller, actionable steps.');
  return tips;
}

// ─── WEEKLY PLANNING ──────────────────────────────────
export function generateWeeklyPlan(tasks, habits) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const pending = prioritizeTasks(tasks);

  return days.map((day, i) => {
    const isWeekend = i >= 5;
    const dayTasks = pending.slice(i * 2, i * 2 + (isWeekend ? 1 : 3));
    return {
      day,
      tasks: dayTasks,
      focusHours: isWeekend ? 2 : 6,
      theme: getDayTheme(day),
      habits: (habits || []).map(h => ({ ...h, target: true })),
    };
  });
}

function getDayTheme(day) {
  const themes = {
    Monday: 'Planning & High Priority', Tuesday: 'Deep Work', Wednesday: 'Creative Tasks',
    Thursday: 'Collaboration & Meetings', Friday: 'Review & Wrap-up',
    Saturday: 'Learning & Side Projects', Sunday: 'Rest & Weekly Review',
  };
  return themes[day] || 'General';
}

// ─── WORK PATTERN ANALYSIS ────────────────────────────
export function analyzeWorkPatterns(tasks, focusSessions) {
  return {
    mostProductiveDay: 'Tuesday',
    mostProductiveHour: '9:00 AM',
    avgTasksPerDay: 4.2,
    avgFocusPerDay: '4.5h',
    completionRate: tasks.length ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100) : 0,
    patterns: [
      { insight: 'You complete 40% more tasks on Tuesdays', type: 'positive' },
      { insight: 'Productivity drops 30% after 3 PM', type: 'warning' },
      { insight: 'Morning focus sessions are 25% more effective', type: 'positive' },
      { insight: 'Task completion spikes after using the Pomodoro timer', type: 'positive' },
    ],
    weeklyHeatmap: generateHeatmapData(),
  };
}

function generateHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7am-6pm
  return days.map(day => ({
    day,
    hours: hours.map(h => ({ hour: h, intensity: Math.floor(Math.random() * 10) + 1 })),
  }));
}

// ─── SMART BREAK RECOMMENDATIONS ──────────────────────
export function recommendBreaks(focusSessions) {
  const totalMinutes = (focusSessions || []).reduce((s, f) => s + (f.duration || 25), 0);
  const breaks = [];

  if (totalMinutes > 90) breaks.push({ type: 'active', duration: 10, activity: 'Take a 10-minute walk', emoji: '🚶' });
  if (totalMinutes > 180) breaks.push({ type: 'rest', duration: 20, activity: 'Practice deep breathing or meditation', emoji: '🧘' });
  if (totalMinutes > 60) breaks.push({ type: 'hydration', duration: 5, activity: 'Drink water and stretch', emoji: '💧' });
  if (totalMinutes < 30) breaks.push({ type: 'start', duration: 0, activity: 'Start a 25-minute focus session', emoji: '🎯' });

  return breaks;
}

// ─── OVERDUE PREDICTION ───────────────────────────────
export function predictOverdue(tasks) {
  return tasks
    .filter(t => t.status !== 'done' && t.deadline)
    .map(task => {
      const daysLeft = (new Date(task.deadline) - new Date()) / 86400000;
      const estimated = estimateTaskDuration(task);
      const riskScore = daysLeft < 0 ? 100 : daysLeft < 1 ? 85 : daysLeft < 2 ? 60 : daysLeft < 5 ? 30 : 10;

      return {
        ...task,
        daysLeft: Math.round(daysLeft * 10) / 10,
        riskScore,
        riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
        estimatedMinutes: estimated,
        suggestion: riskScore >= 70 ? 'Start immediately or delegate' : riskScore >= 40 ? 'Schedule for tomorrow morning' : 'On track',
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

// ─── PRODUCTIVITY SUMMARY GENERATOR ───────────────────
export function generateProductivitySummary(tasks, habits, focusSessions, burnout) {
  const completed = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status !== 'done').length;
  const habitRate = habits?.length ? Math.round(habits.filter(h => h.completedToday).length / habits.length * 100) : 0;

  return {
    headline: completed > pending ? '🎉 Great day! You\'re ahead of schedule.' : pending > 5 ? '⚡ Busy day ahead — let\'s prioritize.' : '📊 Steady progress. Keep it up.',
    stats: { completed, pending, habitRate, focusMinutes: (focusSessions || []).reduce((s, f) => s + (f.duration || 25), 0) },
    insights: [
      `You've completed ${completed} task${completed !== 1 ? 's' : ''} and have ${pending} pending.`,
      `Habit completion rate: ${habitRate}%.`,
      burnout.level === 'high' ? '⚠️ Burnout risk is elevated. Consider lighter workload.' : 'Workload balance looks healthy.',
    ],
    actionItems: generateActionItems(tasks, habits),
  };
}

function generateActionItems(tasks, habits) {
  const items = [];
  const overdue = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date());
  if (overdue.length) items.push({ action: `Address ${overdue.length} overdue task(s)`, priority: 'high' });

  const inProgress = tasks.filter(t => t.status === 'in-progress');
  if (inProgress.length) items.push({ action: `Finish ${inProgress.length} in-progress task(s)`, priority: 'medium' });

  const incompleteHabits = (habits || []).filter(h => !h.completedToday);
  if (incompleteHabits.length) items.push({ action: `Complete ${incompleteHabits.length} remaining habit(s)`, priority: 'low' });

  return items;
}

// ─── UTILITY ──────────────────────────────────────────
function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
