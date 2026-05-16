/**
 * NexusAI — Automation Engine
 * Smart automation workflows: recurring tasks, auto-categorization,
 * dependency management, smart reminders, and workflow triggers.
 */

// ─── RECURRING TASKS ──────────────────────────────────
export function processRecurringTasks(tasks, rules) {
  const generated = [];
  const defaultRules = rules || [
    { id: 'r1', title: 'Weekly Review', frequency: 'weekly', day: 'Friday', priority: 'medium', category: 'Management', template: { description: 'Review completed tasks, plan next week, and update goals' } },
    { id: 'r2', title: 'Daily Standup Prep', frequency: 'daily', priority: 'low', category: 'Management', template: { description: 'Prepare notes and blockers for daily standup' } },
    { id: 'r3', title: 'Inbox Zero', frequency: 'daily', priority: 'low', category: 'Management', template: { description: 'Process all unread emails and messages' } },
  ];

  defaultRules.forEach(rule => {
    const existing = tasks.find(t => t.title === rule.title && t.status !== 'done');
    if (!existing && shouldGenerate(rule)) {
      generated.push({
        id: `auto-${Date.now()}-${rule.id}`,
        title: rule.title,
        description: rule.template?.description || '',
        priority: rule.priority,
        category: rule.category,
        status: 'todo',
        deadline: getNextDeadline(rule),
        tags: ['recurring', 'auto-generated'],
        subtasks: [],
        isRecurring: true,
        recurringRuleId: rule.id,
        createdAt: new Date().toISOString().split('T')[0],
        xp: 15,
      });
    }
  });
  return generated;
}

function shouldGenerate(rule) {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  if (rule.frequency === 'daily') return true;
  if (rule.frequency === 'weekly' && day === rule.day) return true;
  if (rule.frequency === 'monthly' && now.getDate() === (rule.dayOfMonth || 1)) return true;
  return false;
}

function getNextDeadline(rule) {
  const now = new Date();
  if (rule.frequency === 'daily') return now.toISOString().split('T')[0];
  if (rule.frequency === 'weekly') {
    const next = new Date(now);
    next.setDate(now.getDate() + 7);
    return next.toISOString().split('T')[0];
  }
  return now.toISOString().split('T')[0];
}

// ─── AUTO CATEGORIZATION ─────────────────────────────
export function autoCategorize(taskTitle) {
  const title = taskTitle.toLowerCase();
  const rules = [
    { keywords: ['design', 'ui', 'ux', 'wireframe', 'mockup', 'figma', 'prototype', 'layout', 'css', 'style'], category: 'Design' },
    { keywords: ['code', 'develop', 'api', 'bug', 'fix', 'implement', 'build', 'deploy', 'test', 'refactor', 'backend', 'frontend', 'database'], category: 'Development' },
    { keywords: ['write', 'blog', 'article', 'content', 'copy', 'documentation', 'docs'], category: 'Content' },
    { keywords: ['research', 'analyze', 'study', 'explore', 'investigate', 'review'], category: 'Research' },
    { keywords: ['market', 'campaign', 'social', 'ads', 'seo', 'email', 'newsletter', 'launch'], category: 'Marketing' },
    { keywords: ['meet', 'standup', 'plan', 'review', 'manage', 'hire', 'onboard', 'team'], category: 'Management' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(kw => title.includes(kw))) return rule.category;
  }
  return 'General';
}

// ─── AUTO PRIORITY DETECTION ──────────────────────────
export function autoPriority(taskTitle, deadline) {
  const title = taskTitle.toLowerCase();
  const urgentWords = ['urgent', 'asap', 'critical', 'blocker', 'emergency', 'immediately', 'hotfix'];
  const highWords = ['important', 'key', 'essential', 'required', 'must', 'deadline'];

  if (urgentWords.some(w => title.includes(w))) return 'high';
  if (highWords.some(w => title.includes(w))) return 'high';
  if (deadline) {
    const days = (new Date(deadline) - new Date()) / 86400000;
    if (days < 1) return 'high';
    if (days < 3) return 'medium';
  }
  return 'medium';
}

// ─── TASK DEPENDENCIES ────────────────────────────────
export function resolveDependencies(tasks) {
  return tasks.map(task => {
    if (!task.dependencies?.length) return { ...task, blocked: false, blockedBy: [] };
    const blockers = task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter(t => t && t.status !== 'done');
    return { ...task, blocked: blockers.length > 0, blockedBy: blockers.map(b => b.title) };
  });
}

// ─── SMART REMINDERS ──────────────────────────────────
export function generateSmartReminders(tasks, events) {
  const reminders = [];
  const now = new Date();

  // Task deadline reminders
  tasks.filter(t => t.status !== 'done' && t.deadline).forEach(task => {
    const deadline = new Date(task.deadline);
    const hoursLeft = (deadline - now) / 3600000;

    if (hoursLeft > 0 && hoursLeft <= 2) {
      reminders.push({ id: `rem-${task.id}-urgent`, type: 'urgent', title: `⏰ "${task.title}" is due in ${Math.round(hoursLeft)}h`, taskId: task.id, priority: 'critical', timing: 'now' });
    } else if (hoursLeft > 0 && hoursLeft <= 24) {
      reminders.push({ id: `rem-${task.id}-today`, type: 'deadline', title: `📋 "${task.title}" is due today`, taskId: task.id, priority: 'high', timing: 'morning' });
    } else if (hoursLeft > 0 && hoursLeft <= 72) {
      reminders.push({ id: `rem-${task.id}-soon`, type: 'upcoming', title: `📅 "${task.title}" is due in ${Math.round(hoursLeft / 24)} days`, taskId: task.id, priority: 'medium', timing: 'daily' });
    }
  });

  // Event reminders
  (events || []).forEach(event => {
    reminders.push({ id: `rem-event-${event.id}`, type: 'event', title: `🗓️ "${event.title}" at ${event.time}`, priority: 'medium', timing: '15min-before' });
  });

  // Stale task nudges
  tasks.filter(t => t.status === 'todo' && t.createdAt && (now - new Date(t.createdAt)) / 86400000 > 3).forEach(task => {
    reminders.push({ id: `rem-${task.id}-stale`, type: 'nudge', title: `💡 "${task.title}" has been pending for ${Math.round((now - new Date(task.createdAt)) / 86400000)} days`, taskId: task.id, priority: 'low', timing: 'daily' });
  });

  return reminders.sort((a, b) => {
    const pri = { critical: 0, high: 1, medium: 2, low: 3 };
    return (pri[a.priority] || 3) - (pri[b.priority] || 3);
  });
}

// ─── WORKFLOW TRIGGERS ────────────────────────────────
export function processWorkflowTriggers(action, task, tasks) {
  const results = [];

  if (action === 'complete' && task.status === 'done') {
    // Auto-start dependent tasks
    const dependents = tasks.filter(t => t.dependencies?.includes(task.id) && t.status === 'todo');
    dependents.forEach(t => {
      results.push({ type: 'status_change', taskId: t.id, update: { status: 'todo' }, message: `"${t.title}" is now unblocked` });
    });

    // XP reward
    const xp = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15;
    results.push({ type: 'xp_reward', xp, message: `+${xp} XP earned` });

    // Streak check
    results.push({ type: 'streak_check', message: 'Streak updated' });
  }

  if (action === 'overdue') {
    results.push({ type: 'notification', message: `⚠️ "${task.title}" is now overdue`, priority: 'high' });
    results.push({ type: 'priority_escalate', taskId: task.id, update: { priority: 'high' }, message: 'Priority auto-escalated' });
  }

  return results;
}

// ─── BATCH ACTIONS ────────────────────────────────────
export function batchUpdateTasks(tasks, ids, update) {
  return tasks.map(t => ids.includes(t.id) ? { ...t, ...update } : t);
}

// ─── TASK TEMPLATES ───────────────────────────────────
export const taskTemplates = [
  { id: 'tmpl-1', name: 'Bug Fix', icon: '🐛', fields: { priority: 'high', category: 'Development', tags: ['bug', 'fix'], subtasks: [{ title: 'Reproduce', done: false }, { title: 'Debug', done: false }, { title: 'Fix', done: false }, { title: 'Test', done: false }] } },
  { id: 'tmpl-2', name: 'Feature', icon: '✨', fields: { priority: 'medium', category: 'Development', tags: ['feature'], subtasks: [{ title: 'Design', done: false }, { title: 'Implement', done: false }, { title: 'Test', done: false }, { title: 'Review', done: false }] } },
  { id: 'tmpl-3', name: 'Blog Post', icon: '📝', fields: { priority: 'medium', category: 'Content', tags: ['content'], subtasks: [{ title: 'Research', done: false }, { title: 'Outline', done: false }, { title: 'Write draft', done: false }, { title: 'Edit & publish', done: false }] } },
  { id: 'tmpl-4', name: 'Meeting', icon: '🤝', fields: { priority: 'medium', category: 'Management', tags: ['meeting'], subtasks: [{ title: 'Prepare agenda', done: false }, { title: 'Send invites', done: false }, { title: 'Follow-up notes', done: false }] } },
  { id: 'tmpl-5', name: 'Research', icon: '🔬', fields: { priority: 'medium', category: 'Research', tags: ['research'], subtasks: [{ title: 'Define scope', done: false }, { title: 'Gather sources', done: false }, { title: 'Analyze', done: false }, { title: 'Document findings', done: false }] } },
  { id: 'tmpl-6', name: 'Design Review', icon: '🎨', fields: { priority: 'medium', category: 'Design', tags: ['design', 'review'], subtasks: [{ title: 'Review mockups', done: false }, { title: 'Feedback', done: false }, { title: 'Iterate', done: false }] } },
];

// ─── NATURAL LANGUAGE TASK PARSER ─────────────────────
export function parseNaturalLanguageTask(input) {
  const result = { title: input, priority: 'medium', category: 'General', deadline: null, tags: [] };

  // Extract deadline patterns
  const tmrw = /\b(tomorrow|tmrw)\b/i;
  const today = /\btoday\b/i;
  const nextWeek = /\bnext\s*week\b/i;
  const byDate = /\bby\s+(\d{4}-\d{2}-\d{2})\b/;

  if (today.test(input)) {
    result.deadline = new Date().toISOString().split('T')[0];
    result.title = input.replace(today, '').trim();
  } else if (tmrw.test(input)) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    result.deadline = d.toISOString().split('T')[0];
    result.title = input.replace(tmrw, '').trim();
  } else if (nextWeek.test(input)) {
    const d = new Date(); d.setDate(d.getDate() + 7);
    result.deadline = d.toISOString().split('T')[0];
    result.title = input.replace(nextWeek, '').trim();
  } else if (byDate.test(input)) {
    result.deadline = input.match(byDate)[1];
    result.title = input.replace(byDate, '').trim();
  }

  // Extract priority
  if (/\b(urgent|critical|asap|!!!)\b/i.test(input)) { result.priority = 'high'; result.title = result.title.replace(/\b(urgent|critical|asap|!!!)\b/gi, '').trim(); }
  if (/\b(low\s*priority|minor|whenever)\b/i.test(input)) { result.priority = 'low'; result.title = result.title.replace(/\b(low\s*priority|minor|whenever)\b/gi, '').trim(); }

  // Extract tags
  const tagMatch = input.match(/#(\w+)/g);
  if (tagMatch) {
    result.tags = tagMatch.map(t => t.slice(1));
    result.title = result.title.replace(/#\w+/g, '').trim();
  }

  // Auto-categorize
  result.category = autoCategorize(result.title);

  // Clean up
  result.title = result.title.replace(/\s+/g, ' ').trim();
  if (result.title.endsWith(' by') || result.title.endsWith(' on')) result.title = result.title.slice(0, -3).trim();

  return result;
}
