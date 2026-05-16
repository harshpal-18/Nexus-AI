import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  calculateProductivityScore, detectBurnout, analyzeFocus, prioritizeTasks,
  generateDailySchedule, detectProcrastination, generateWeeklyPlan,
  analyzeWorkPatterns, recommendBreaks, predictOverdue,
  generateProductivitySummary, estimateTaskDuration,
} from '../services/ai/productivityEngine';
import {
  autoCategorize, autoPriority, generateSmartReminders,
  processWorkflowTriggers, parseNaturalLanguageTask, taskTemplates,
} from '../services/automation/automationEngine';
import {
  generateHeatmap, analyzeTrends, trackGoals, analyzeMood,
  generateReport, exportTasksCSV, downloadCSV, forecastProductivity,
} from '../services/analytics/analyticsEngine';
import { globalSearch, filterTasks, filterPresets } from '../services/search/searchEngine';
import { storage, saveAppState, loadAppState, logActivity, requestNotificationPermission, sendBrowserNotification } from '../services/storage/storageEngine';

const AppContext = createContext();

// ─── SAMPLE DATA ──────────────────────────────────────
const initialTasks = [
  { id: '1', title: 'Design new landing page', description: 'Create wireframes and mockups for the new product landing page', priority: 'high', category: 'Design', status: 'in-progress', deadline: '2026-05-15', tags: ['ui', 'urgent'], subtasks: [{ id: 's1', title: 'Wireframe', done: true }, { id: 's2', title: 'Mockup', done: false }, { id: 's3', title: 'Review', done: false }], createdAt: '2026-05-10', xp: 50 },
  { id: '2', title: 'Implement authentication API', description: 'Build JWT-based auth endpoints with refresh tokens', priority: 'high', category: 'Development', status: 'todo', deadline: '2026-05-16', tags: ['backend', 'security'], subtasks: [{ id: 's4', title: 'Login endpoint', done: false }, { id: 's5', title: 'Register endpoint', done: false }], createdAt: '2026-05-11', xp: 80 },
  { id: '3', title: 'Write blog post on AI productivity', description: 'Research and write a comprehensive guide on AI tools', priority: 'medium', category: 'Content', status: 'todo', deadline: '2026-05-18', tags: ['content', 'ai'], subtasks: [], createdAt: '2026-05-12', xp: 30 },
  { id: '4', title: 'Team standup preparation', description: 'Prepare notes and blockers for daily standup', priority: 'low', category: 'Management', status: 'done', deadline: '2026-05-13', tags: ['daily'], subtasks: [], createdAt: '2026-05-12', xp: 10 },
  { id: '5', title: 'Database optimization', description: 'Optimize MongoDB queries and add proper indexing', priority: 'high', category: 'Development', status: 'in-progress', deadline: '2026-05-14', tags: ['backend', 'performance'], subtasks: [{ id: 's6', title: 'Analyze slow queries', done: true }, { id: 's7', title: 'Add indexes', done: false }], createdAt: '2026-05-09', xp: 60 },
  { id: '6', title: 'User research interviews', description: 'Conduct interviews with 5 beta users', priority: 'medium', category: 'Research', status: 'todo', deadline: '2026-05-20', tags: ['research', 'ux'], subtasks: [], createdAt: '2026-05-11', xp: 40 },
  { id: '7', title: 'Fix mobile responsiveness bugs', description: 'Address layout issues on tablets and small screens', priority: 'medium', category: 'Development', status: 'done', deadline: '2026-05-12', tags: ['frontend', 'bug'], subtasks: [], createdAt: '2026-05-08', xp: 35 },
  { id: '8', title: 'Create marketing email template', description: 'Design and code HTML email for product launch', priority: 'low', category: 'Marketing', status: 'todo', deadline: '2026-05-22', tags: ['marketing', 'email'], subtasks: [], createdAt: '2026-05-13', xp: 25 },
];

const initialHabits = [
  { id: 'h1', title: 'Morning meditation', icon: '🧘', streak: 12, completedToday: true, color: '#2563EB' },
  { id: 'h2', title: 'Exercise 30 min', icon: '💪', streak: 8, completedToday: false, color: '#22C55E' },
  { id: 'h3', title: 'Read 20 pages', icon: '📖', streak: 15, completedToday: true, color: '#8B5CF6' },
  { id: 'h4', title: 'Drink 8 glasses water', icon: '💧', streak: 5, completedToday: false, color: '#EF4444' },
  { id: 'h5', title: 'No social media before noon', icon: '📵', streak: 3, completedToday: true, color: '#F59E0B' },
];

const initialFocusSessions = [
  { id: 'fs1', date: '2026-05-13', startHour: 9, duration: 25, type: 'focus' },
  { id: 'fs2', date: '2026-05-13', startHour: 10, duration: 50, type: 'focus' },
  { id: 'fs3', date: '2026-05-13', startHour: 14, duration: 25, type: 'focus' },
  { id: 'fs4', date: '2026-05-12', startHour: 9, duration: 45, type: 'focus' },
  { id: 'fs5', date: '2026-05-12', startHour: 11, duration: 25, type: 'focus' },
  { id: 'fs6', date: '2026-05-11', startHour: 10, duration: 50, type: 'focus' },
];

const productivityData = {
  weeklyScore: 82,
  dailyScores: [
    { day: 'Mon', score: 75, tasks: 6 }, { day: 'Tue', score: 88, tasks: 8 },
    { day: 'Wed', score: 92, tasks: 9 }, { day: 'Thu', score: 70, tasks: 5 },
    { day: 'Fri', score: 85, tasks: 7 }, { day: 'Sat', score: 60, tasks: 3 },
    { day: 'Sun', score: 78, tasks: 4 },
  ],
  monthlyData: [
    { month: 'Jan', completed: 45, total: 60 }, { month: 'Feb', completed: 52, total: 65 },
    { month: 'Mar', completed: 48, total: 55 }, { month: 'Apr', completed: 62, total: 70 },
    { month: 'May', completed: 38, total: 50 },
  ],
  focusHours: 6.5, streak: 12, totalXP: 2450, level: 8,
  badges: [
    // Productivity
    { id: 'b1', title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', icon: '🌅', earned: true, category: 'productivity' },
    { id: 'b2', title: 'Streak Master', description: '10-day productivity streak', icon: '🔥', earned: true, category: 'productivity' },
    { id: 'b3', title: 'Task Crusher', description: 'Complete 100 tasks total', icon: '💪', earned: false, category: 'productivity', progress: 35, target: 100 },
    { id: 'b4', title: 'Speed Demon', description: 'Finish 5 tasks in one hour', icon: '⚡', earned: true, category: 'productivity' },
    { id: 'b5', title: 'Night Owl', description: 'Complete tasks after midnight', icon: '🦉', earned: true, category: 'productivity' },
    { id: 'b6', title: 'Perfectionist', description: 'Complete 10 tasks with all subtasks done', icon: '✨', earned: false, category: 'productivity', progress: 6, target: 10 },
    // Focus
    { id: 'b7', title: 'Focus Champion', description: '8 hours of deep focus in one day', icon: '🎯', earned: true, category: 'focus' },
    { id: 'b8', title: 'Zen Master', description: '50 Pomodoro sessions completed', icon: '🧘', earned: false, category: 'focus', progress: 28, target: 50 },
    { id: 'b9', title: 'Marathon Runner', description: '4-hour uninterrupted focus session', icon: '🏃', earned: false, category: 'focus', progress: 0, target: 1 },
    { id: 'b10', title: 'Deep Thinker', description: 'Accumulate 100 hours of focus time', icon: '🧠', earned: false, category: 'focus', progress: 62, target: 100 },
    // Habits & Wellness
    { id: 'b11', title: 'Habit Hero', description: 'Complete all habits for 7 days straight', icon: '🏅', earned: true, category: 'habits' },
    { id: 'b12', title: 'Comeback King', description: 'Recover a broken streak within 24h', icon: '👑', earned: true, category: 'habits' },
    { id: 'b13', title: 'Wellness Warrior', description: 'Take all recommended breaks for a week', icon: '💚', earned: false, category: 'habits', progress: 4, target: 7 },
    // AI & Social
    { id: 'b14', title: 'AI Explorer', description: 'Use AI features 50 times', icon: '🤖', earned: false, category: 'ai', progress: 22, target: 50 },
    { id: 'b15', title: 'Team Player', description: 'Collaborate on 20 tasks', icon: '🤝', earned: true, category: 'social' },
    { id: 'b16', title: 'Mentor', description: 'Assign tasks to 5 team members', icon: '🎓', earned: false, category: 'social', progress: 3, target: 5 },
    // Milestones
    { id: 'b17', title: 'Trailblazer', description: 'Use NexusAI for 30 consecutive days', icon: '🚀', earned: false, category: 'milestone', progress: 18, target: 30 },
    { id: 'b18', title: 'Inbox Zero', description: 'Clear all pending tasks in a single day', icon: '📭', earned: true, category: 'milestone' },
  ],
};

const notifications = [
  { id: 'n1', type: 'reminder', title: 'Task deadline approaching', message: 'Database optimization is due tomorrow', time: '5 min ago', read: false, priority: 'high' },
  { id: 'n2', type: 'ai', title: 'AI Suggestion', message: 'Your productivity peaks between 9-11 AM. Consider scheduling important tasks during this window.', time: '1 hour ago', read: false, priority: 'medium' },
  { id: 'n3', type: 'achievement', title: 'Badge Earned!', message: 'You earned the "Streak Master" badge for a 10-day streak!', time: '2 hours ago', read: true, priority: 'low' },
  { id: 'n4', type: 'team', title: 'New Comment', message: 'Sarah commented on "Design new landing page"', time: '3 hours ago', read: true, priority: 'low' },
  { id: 'n5', type: 'system', title: 'Calendar Synced', message: 'Google Calendar successfully synchronized', time: '5 hours ago', read: true, priority: 'low' },
];

const calendarEvents = [
  { id: 'e1', title: 'Team Standup', date: '2026-05-13', time: '09:00', duration: 30, color: '#2563EB', type: 'meeting' },
  { id: 'e2', title: 'Design Review', date: '2026-05-13', time: '14:00', duration: 60, color: '#8B5CF6', type: 'meeting' },
  { id: 'e3', title: 'Focus Time - Development', date: '2026-05-14', time: '10:00', duration: 120, color: '#22C55E', type: 'focus' },
  { id: 'e4', title: 'Sprint Planning', date: '2026-05-15', time: '11:00', duration: 90, color: '#EF4444', type: 'meeting' },
  { id: 'e5', title: 'Client Presentation', date: '2026-05-16', time: '15:00', duration: 60, color: '#F59E0B', type: 'meeting' },
  { id: 'e6', title: 'Code Review Session', date: '2026-05-14', time: '16:00', duration: 45, color: '#2563EB', type: 'meeting' },
  { id: 'e7', title: 'AI Integration Research', date: '2026-05-15', time: '09:00', duration: 120, color: '#22C55E', type: 'focus' },
];

const teamMembers = [
  { id: 'tm1', name: 'Sarah Chen', role: 'Lead Designer', avatar: '👩‍🎨', status: 'online', tasksCompleted: 34 },
  { id: 'tm2', name: 'Alex Rivera', role: 'Full Stack Dev', avatar: '👨‍💻', status: 'online', tasksCompleted: 42 },
  { id: 'tm3', name: 'Priya Sharma', role: 'Product Manager', avatar: '👩‍💼', status: 'away', tasksCompleted: 28 },
  { id: 'tm4', name: 'James Wilson', role: 'Backend Dev', avatar: '🧑‍💻', status: 'offline', tasksCompleted: 38 },
  { id: 'tm5', name: 'Maya Johnson', role: 'Data Analyst', avatar: '👩‍🔬', status: 'online', tasksCompleted: 25 },
];

// ─── PROVIDER ─────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);
  const [focusSessions, setFocusSessions] = useState(initialFocusSessions);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-theme') || 'dark';
    return 'dark';
  });
  const [notificationList, setNotificationList] = useState(notifications);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);

  // Theme persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Auto-save state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveAppState({ tasks, habits, focusSessions, notificationList, activityLog, archivedTasks });
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks, habits, focusSessions, notificationList, activityLog, archivedTasks]);

  // Request browser notification permission on login
  useEffect(() => {
    if (isAuthenticated) requestNotificationPermission();
  }, [isAuthenticated]);

  // ── AI ENGINE (computed on every state change) ──────
  const aiInsights = useMemo(() => {
    const score = calculateProductivityScore(tasks, focusSessions, habits);
    const burnout = detectBurnout(tasks, focusSessions, habits);
    const focus = analyzeFocus(focusSessions, tasks);
    const prioritized = prioritizeTasks(tasks);
    const schedule = generateDailySchedule(tasks, calendarEvents, focus);
    const procrastination = detectProcrastination(tasks);
    const weeklyPlan = generateWeeklyPlan(tasks, habits);
    const workPatterns = analyzeWorkPatterns(tasks, focusSessions);
    const breaks = recommendBreaks(focusSessions);
    const overdueRisks = predictOverdue(tasks);
    const summary = generateProductivitySummary(tasks, habits, focusSessions, burnout);
    const smartReminders = generateSmartReminders(tasks, calendarEvents);

    return {
      score, burnout, focus, prioritized, schedule, procrastination,
      weeklyPlan, workPatterns, breaks, overdueRisks, summary, smartReminders,
    };
  }, [tasks, habits, focusSessions]);

  // ── ANALYTICS ENGINE ────────────────────────────────
  const analytics = useMemo(() => {
    const heatmap = generateHeatmap(tasks, focusSessions);
    const trends = analyzeTrends(tasks);
    const goals = trackGoals();
    const mood = analyzeMood();
    const forecast = forecastProductivity(tasks);

    return { heatmap, trends, goals, mood, forecast };
  }, [tasks, focusSessions]);

  // ── TASK CRUD WITH AUTOMATION ───────────────────────
  const addTask = useCallback((taskOrInput) => {
    let task;
    if (typeof taskOrInput === 'string') {
      // Natural language input
      task = parseNaturalLanguageTask(taskOrInput);
    } else {
      task = taskOrInput;
    }

    // Auto-categorize and auto-priority if not set
    if (!task.category || task.category === 'General') task.category = autoCategorize(task.title);
    if (!task.priority) task.priority = autoPriority(task.title, task.deadline);

    // Auto-estimate duration
    task.estimatedMinutes = estimateTaskDuration(task);

    const newTask = {
      ...task,
      id: Date.now().toString(),
      status: task.status || 'todo',
      subtasks: task.subtasks || [],
      tags: task.tags || [],
      createdAt: new Date().toISOString().split('T')[0],
      xp: task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15,
    };

    setTasks(prev => [...prev, newTask]);
    setActivityLog(prev => logActivity('task_created', { title: newTask.title, id: newTask.id }, prev));

    // Browser notification for high priority
    if (newTask.priority === 'high') {
      sendBrowserNotification('High Priority Task Added', { body: newTask.title });
    }

    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setActivityLog(prev => logActivity('task_updated', { id, updates }, prev));
  }, []);

  const completeTask = useCallback((id) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t;
        const completed = { ...t, status: 'done', completedAt: new Date().toISOString() };
        // Process workflow triggers
        const triggers = processWorkflowTriggers('complete', completed, prev);
        triggers.forEach(trigger => {
          if (trigger.type === 'notification') {
            sendBrowserNotification('Task Update', { body: trigger.message });
          }
        });
        return completed;
      });
      return updated;
    });
    setActivityLog(prev => logActivity('task_completed', { id }, prev));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setActivityLog(prev => logActivity('task_deleted', { id }, prev));
  }, []);

  const archiveTask = useCallback((id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) setArchivedTasks(arc => [...arc, { ...task, archivedAt: new Date().toISOString() }]);
      return prev.filter(t => t.id !== id);
    });
    setActivityLog(prev => logActivity('task_archived', { id }, prev));
  }, []);

  const restoreTask = useCallback((id) => {
    setArchivedTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) setTasks(t => [...t, { ...task, archivedAt: undefined }]);
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // ── FOCUS SESSION TRACKING ──────────────────────────
  const addFocusSession = useCallback((session) => {
    const entry = {
      id: `fs-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      startHour: new Date().getHours(),
      ...session,
    };
    setFocusSessions(prev => [...prev, entry]);
    setActivityLog(prev => logActivity('focus_session', { duration: entry.duration }, prev));
    return entry;
  }, []);

  // ── HABITS ──────────────────────────────────────────
  const toggleHabit = useCallback((id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h));
    setActivityLog(prev => logActivity('habit_toggled', { id }, prev));
  }, []);

  const addHabit = useCallback((habit) => {
    const newHabit = { id: `h-${Date.now()}`, streak: 0, completedToday: false, color: '#2563EB', ...habit };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  // ── NOTIFICATIONS ───────────────────────────────────
  const markNotificationRead = useCallback((id) => {
    setNotificationList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((notification) => {
    const n = { id: `n-${Date.now()}`, time: 'Just now', read: false, ...notification };
    setNotificationList(prev => [n, ...prev]);
    sendBrowserNotification(n.title, { body: n.message });
    return n;
  }, []);

  // ── SEARCH ──────────────────────────────────────────
  const search = useCallback((query) => {
    return globalSearch(query, { tasks, events: calendarEvents, habits, teamMembers });
  }, [tasks, habits]);

  const searchTasks = useCallback((filters) => {
    return filterTasks(tasks, filters);
  }, [tasks]);

  // ── EXPORT ──────────────────────────────────────────
  const exportTasks = useCallback((format = 'csv') => {
    if (format === 'csv') {
      const csv = exportTasksCSV(tasks);
      downloadCSV(csv);
    } else {
      const report = generateReport(tasks, habits, focusSessions);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nexusai-report.json'; a.click();
      URL.revokeObjectURL(url);
    }
  }, [tasks, habits, focusSessions]);

  // ── AUTH ─────────────────────────────────────────────
  const login = useCallback((firebaseUser) => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    setUser({
      name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User',
      email: firebaseUser?.email || '',
      avatar: '🧑‍💻',
      role: 'Pro Member',
      joinDate: new Date().toISOString().split('T')[0],
      photoURL: firebaseUser?.photoURL || null,
    });
  }, []);
  const logout = useCallback(() => { setIsAuthenticated(false); setCurrentPage('landing'); }, []);

  // ── CONTEXT VALUE ───────────────────────────────────
  const value = {
    // Core state
    user, setUser,
    tasks, setTasks, addTask, updateTask, deleteTask, completeTask, archiveTask, restoreTask, archivedTasks,
    habits, setHabits, toggleHabit, addHabit,
    focusSessions, setFocusSessions, addFocusSession,
    isAuthenticated, login, logout,
    sidebarOpen, setSidebarOpen,
    currentPage, setCurrentPage,
    theme, setTheme, toggleTheme,
    notificationList, setNotificationList, markNotificationRead, addNotification,
    pomodoroActive, setPomodoroActive,
    focusModeActive, setFocusModeActive,
    aiChatOpen, setAiChatOpen,
    activityLog,

    // Static data
    productivityData, calendarEvents, teamMembers,

    // AI Engine
    aiInsights,

    // Analytics Engine
    analytics,

    // Search & Filter
    search, searchTasks, filterPresets,

    // Automation
    taskTemplates, parseNaturalLanguageTask,

    // Export
    exportTasks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
