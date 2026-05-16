import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import {
  doc, setDoc, getDoc, updateDoc, collection,
  onSnapshot, addDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
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
import { logActivity, requestNotificationPermission, sendBrowserNotification } from '../services/storage/storageEngine';

const AppContext = createContext();

// ─── STATIC DATA (cleaned — no demo values) ───────────
const productivityData = {
  weeklyScore: 0,
  dailyScores: [
    { day: 'Mon', score: 0, tasks: 0 }, { day: 'Tue', score: 0, tasks: 0 },
    { day: 'Wed', score: 0, tasks: 0 }, { day: 'Thu', score: 0, tasks: 0 },
    { day: 'Fri', score: 0, tasks: 0 }, { day: 'Sat', score: 0, tasks: 0 },
    { day: 'Sun', score: 0, tasks: 0 },
  ],
  monthlyData: [],
  focusHours: 0, streak: 0, totalXP: 0, level: 1,
  badges: [
    { id: 'b1', title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', icon: '🌅', earned: false, category: 'productivity' },
    { id: 'b2', title: 'Streak Master', description: '10-day productivity streak', icon: '🔥', earned: false, category: 'productivity' },
    { id: 'b3', title: 'Task Crusher', description: 'Complete 100 tasks total', icon: '💪', earned: false, category: 'productivity', progress: 0, target: 100 },
    { id: 'b4', title: 'Speed Demon', description: 'Finish 5 tasks in one hour', icon: '⚡', earned: false, category: 'productivity' },
    { id: 'b5', title: 'Night Owl', description: 'Complete tasks after midnight', icon: '🦉', earned: false, category: 'productivity' },
    { id: 'b6', title: 'Perfectionist', description: 'Complete 10 tasks with all subtasks done', icon: '✨', earned: false, category: 'productivity', progress: 0, target: 10 },
    { id: 'b7', title: 'Focus Champion', description: '8 hours of deep focus in one day', icon: '🎯', earned: false, category: 'focus' },
    { id: 'b8', title: 'Zen Master', description: '50 Pomodoro sessions completed', icon: '🧘', earned: false, category: 'focus', progress: 0, target: 50 },
    { id: 'b9', title: 'Marathon Runner', description: '4-hour uninterrupted focus session', icon: '🏃', earned: false, category: 'focus', progress: 0, target: 1 },
    { id: 'b10', title: 'Deep Thinker', description: 'Accumulate 100 hours of focus time', icon: '🧠', earned: false, category: 'focus', progress: 0, target: 100 },
    { id: 'b11', title: 'Habit Hero', description: 'Complete all habits for 7 days straight', icon: '🏅', earned: false, category: 'habits' },
    { id: 'b12', title: 'Comeback King', description: 'Recover a broken streak within 24h', icon: '👑', earned: false, category: 'habits' },
    { id: 'b13', title: 'Wellness Warrior', description: 'Take all recommended breaks for a week', icon: '💚', earned: false, category: 'habits', progress: 0, target: 7 },
    { id: 'b14', title: 'AI Explorer', description: 'Use AI features 50 times', icon: '🤖', earned: false, category: 'ai', progress: 0, target: 50 },
    { id: 'b15', title: 'Team Player', description: 'Collaborate on 20 tasks', icon: '🤝', earned: false, category: 'social' },
    { id: 'b16', title: 'Mentor', description: 'Assign tasks to 5 team members', icon: '🎓', earned: false, category: 'social', progress: 0, target: 5 },
    { id: 'b17', title: 'Trailblazer', description: 'Use NexusAI for 30 consecutive days', icon: '🚀', earned: false, category: 'milestone', progress: 0, target: 30 },
    { id: 'b18', title: 'Inbox Zero', description: 'Clear all pending tasks in a single day', icon: '📭', earned: false, category: 'milestone' },
  ],
};

// ─── Empty calendar — users add their own events ───────
const calendarEvents = [];

// ─── Team members stay as static demo ─────────────────
const teamMembers = [
  { id: 'tm1', name: 'Sarah Chen', role: 'Lead Designer', avatar: '👩‍🎨', status: 'online', tasksCompleted: 34 },
  { id: 'tm2', name: 'Alex Rivera', role: 'Full Stack Dev', avatar: '👨‍💻', status: 'online', tasksCompleted: 42 },
  { id: 'tm3', name: 'Priya Sharma', role: 'Product Manager', avatar: '👩‍💼', status: 'away', tasksCompleted: 28 },
  { id: 'tm4', name: 'James Wilson', role: 'Backend Dev', avatar: '🧑‍💻', status: 'offline', tasksCompleted: 38 },
  { id: 'tm5', name: 'Maya Johnson', role: 'Data Analyst', avatar: '👩‍🔬', status: 'online', tasksCompleted: 25 },
];

const defaultNotifications = [
  { id: 'n1', type: 'ai', title: 'Welcome to NexusAI! 🎉', message: 'Start by adding your first task.', time: 'Just now', read: false, priority: 'medium' },
];

const defaultHabits = [
  { id: 'h1', title: 'Morning meditation', icon: '🧘', streak: 0, completedToday: false, color: '#2563EB' },
  { id: 'h2', title: 'Exercise 30 min', icon: '💪', streak: 0, completedToday: false, color: '#22C55E' },
  { id: 'h3', title: 'Read 20 pages', icon: '📖', streak: 0, completedToday: false, color: '#8B5CF6' },
];

// ─── PROVIDER ─────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('nexus-theme') || 'dark';
    return 'dark';
  });
  const [notificationList, setNotificationList] = useState([]);
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

  // Request browser notification permission on login
  useEffect(() => {
    if (isAuthenticated) requestNotificationPermission();
  }, [isAuthenticated]);

  // ── FIRESTORE: Load user data on login ──────────────
  useEffect(() => {
    if (!userId) return;

    setDataLoading(true);

    const tasksRef = collection(db, 'users', userId, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, (snap) => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(loaded);
    });

    const habitsRef = collection(db, 'users', userId, 'habits');
    const unsubHabits = onSnapshot(habitsRef, async (snap) => {
      if (snap.empty) {
        for (const habit of defaultHabits) {
          await setDoc(doc(db, 'users', userId, 'habits', habit.id), habit);
        }
      } else {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHabits(loaded);
      }
    });

    const focusRef = collection(db, 'users', userId, 'focusSessions');
    const unsubFocus = onSnapshot(focusRef, (snap) => {
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFocusSessions(loaded);
    });

    const notifsRef = collection(db, 'users', userId, 'notifications');
    const unsubNotifs = onSnapshot(notifsRef, async (snap) => {
      if (snap.empty) {
        for (const n of defaultNotifications) {
          await setDoc(doc(db, 'users', userId, 'notifications', n.id), n);
        }
      } else {
        const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotificationList(loaded);
      }
    });

    setDataLoading(false);

    return () => {
      unsubTasks();
      unsubHabits();
      unsubFocus();
      unsubNotifs();
    };
  }, [userId]);

  // ── AI ENGINE ────────────────────────────────────────
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
    return { score, burnout, focus, prioritized, schedule, procrastination, weeklyPlan, workPatterns, breaks, overdueRisks, summary, smartReminders };
  }, [tasks, habits, focusSessions]);

  // ── ANALYTICS ENGINE ─────────────────────────────────
  const analytics = useMemo(() => {
    const heatmap = generateHeatmap(tasks, focusSessions);
    const trends = analyzeTrends(tasks);
    const goals = trackGoals();
    const mood = analyzeMood();
    const forecast = forecastProductivity(tasks);
    return { heatmap, trends, goals, mood, forecast };
  }, [tasks, focusSessions]);

  // ── TASK CRUD (Firestore) ────────────────────────────
  const addTask = useCallback(async (taskOrInput) => {
    let task;
    if (typeof taskOrInput === 'string') {
      task = parseNaturalLanguageTask(taskOrInput);
    } else {
      task = taskOrInput;
    }
    if (!task.category || task.category === 'General') task.category = autoCategorize(task.title);
    if (!task.priority) task.priority = autoPriority(task.title, task.deadline);
    task.estimatedMinutes = estimateTaskDuration(task);

    const newTask = {
      ...task,
      status: task.status || 'todo',
      subtasks: task.subtasks || [],
      tags: task.tags || [],
      createdAt: new Date().toISOString().split('T')[0],
      xp: task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 15,
    };

    if (userId) {
      const ref = await addDoc(collection(db, 'users', userId, 'tasks'), newTask);
      newTask.id = ref.id;
    } else {
      newTask.id = Date.now().toString();
      setTasks(prev => [...prev, newTask]);
    }

    setActivityLog(prev => logActivity('task_created', { title: newTask.title }, prev));
    if (newTask.priority === 'high') sendBrowserNotification('High Priority Task Added', { body: newTask.title });
    return newTask;
  }, [userId]);

  const updateTask = useCallback(async (id, updates) => {
    if (userId) {
      await updateDoc(doc(db, 'users', userId, 'tasks', id), updates);
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    setActivityLog(prev => logActivity('task_updated', { id }, prev));
  }, [userId]);

  const completeTask = useCallback(async (id) => {
    const updates = { status: 'done', completedAt: new Date().toISOString() };
    if (userId) {
      await updateDoc(doc(db, 'users', userId, 'tasks', id), updates);
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
    setActivityLog(prev => logActivity('task_completed', { id }, prev));
  }, [userId]);

  const deleteTask = useCallback(async (id) => {
    if (userId) {
      await deleteDoc(doc(db, 'users', userId, 'tasks', id));
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    setActivityLog(prev => logActivity('task_deleted', { id }, prev));
  }, [userId]);

  const archiveTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const archived = { ...task, archivedAt: new Date().toISOString() };
      setArchivedTasks(prev => [...prev, archived]);
      await deleteTask(id);
    }
  }, [tasks, deleteTask]);

  const restoreTask = useCallback(async (id) => {
    const task = archivedTasks.find(t => t.id === id);
    if (task) {
      const { archivedAt, ...restored } = task;
      setArchivedTasks(prev => prev.filter(t => t.id !== id));
      if (userId) {
        await setDoc(doc(db, 'users', userId, 'tasks', id), restored);
      } else {
        setTasks(prev => [...prev, restored]);
      }
    }
  }, [archivedTasks, userId]);

  // ── FOCUS SESSIONS (Firestore) ───────────────────────
  const addFocusSession = useCallback(async (session) => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      startHour: new Date().getHours(),
      ...session,
    };
    if (userId) {
      await addDoc(collection(db, 'users', userId, 'focusSessions'), entry);
    } else {
      setFocusSessions(prev => [...prev, { ...entry, id: `fs-${Date.now()}` }]);
    }
    setActivityLog(prev => logActivity('focus_session', { duration: entry.duration }, prev));
    return entry;
  }, [userId]);

  // ── HABITS (Firestore) ───────────────────────────────
  const toggleHabit = useCallback(async (id) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const updates = {
      completedToday: !habit.completedToday,
      streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1),
    };
    if (userId) {
      await updateDoc(doc(db, 'users', userId, 'habits', id), updates);
    } else {
      setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    }
    setActivityLog(prev => logActivity('habit_toggled', { id }, prev));
  }, [habits, userId]);

  const addHabit = useCallback(async (habit) => {
    const newHabit = { streak: 0, completedToday: false, color: '#2563EB', ...habit };
    if (userId) {
      const ref = await addDoc(collection(db, 'users', userId, 'habits'), newHabit);
      newHabit.id = ref.id;
    } else {
      newHabit.id = `h-${Date.now()}`;
      setHabits(prev => [...prev, newHabit]);
    }
    return newHabit;
  }, [userId]);

  // ── NOTIFICATIONS (Firestore) ────────────────────────
  const markNotificationRead = useCallback(async (id) => {
    if (userId) {
      await updateDoc(doc(db, 'users', userId, 'notifications', id), { read: true });
    } else {
      setNotificationList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  }, [userId]);

  const addNotification = useCallback(async (notification) => {
    const n = { time: 'Just now', read: false, ...notification };
    if (userId) {
      const ref = await addDoc(collection(db, 'users', userId, 'notifications'), n);
      n.id = ref.id;
    } else {
      n.id = `n-${Date.now()}`;
      setNotificationList(prev => [n, ...prev]);
    }
    sendBrowserNotification(n.title, { body: n.message });
    return n;
  }, [userId]);

  // ── SEARCH ───────────────────────────────────────────
  const search = useCallback((query) => {
    return globalSearch(query, { tasks, events: calendarEvents, habits, teamMembers });
  }, [tasks, habits]);

  const searchTasks = useCallback((filters) => {
    return filterTasks(tasks, filters);
  }, [tasks]);

  // ── EXPORT ───────────────────────────────────────────
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
  const login = useCallback(async (firebaseUser) => {
    const uid = firebaseUser.uid;
    setUserId(uid);
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

    await setDoc(doc(db, 'users', uid), {
      name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User',
      email: firebaseUser?.email || '',
      photoURL: firebaseUser?.photoURL || null,
      lastLogin: serverTimestamp(),
    }, { merge: true });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setUserId(null);
    setUser(null);
    setTasks([]);
    setHabits([]);
    setFocusSessions([]);
    setNotificationList([]);
  }, []);

  // ── CONTEXT VALUE ────────────────────────────────────
  const value = {
    user, setUser,
    tasks, setTasks, addTask, updateTask, deleteTask, completeTask, archiveTask, restoreTask, archivedTasks,
    habits, setHabits, toggleHabit, addHabit,
    focusSessions, setFocusSessions, addFocusSession,
    isAuthenticated, login, logout,
    dataLoading,
    sidebarOpen, setSidebarOpen,
    currentPage, setCurrentPage,
    theme, setTheme, toggleTheme,
    notificationList, setNotificationList, markNotificationRead, addNotification,
    pomodoroActive, setPomodoroActive,
    focusModeActive, setFocusModeActive,
    aiChatOpen, setAiChatOpen,
    activityLog,
    productivityData, calendarEvents, teamMembers,
    aiInsights,
    analytics,
    search, searchTasks, filterPresets,
    taskTemplates, parseNaturalLanguageTask,
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