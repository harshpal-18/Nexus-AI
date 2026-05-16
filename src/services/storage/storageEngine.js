/**
 * NexusAI — Storage & Sync Layer
 * LocalStorage persistence, offline support, sync-ready API abstraction,
 * data export, and browser notification support.
 */

const STORAGE_PREFIX = 'nexusai_';

// ─── LOCAL STORAGE ────────────────────────────────────
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  getAll() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => {
        try { data[k.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(k)); }
        catch { data[k.replace(STORAGE_PREFIX, '')] = localStorage.getItem(k); }
      });
    return data;
  },
};

// ─── STATE PERSISTENCE ────────────────────────────────
export function saveAppState(state) {
  const persist = {
    tasks: state.tasks,
    habits: state.habits,
    notifications: state.notificationList,
    focusSessions: state.focusSessions || [],
    goals: state.goals || [],
    moodEntries: state.moodEntries || [],
    recurringRules: state.recurringRules || [],
    archivedTasks: state.archivedTasks || [],
    activityLog: (state.activityLog || []).slice(-200),
  };
  storage.set('app_state', persist);
}

export function loadAppState() {
  return storage.get('app_state', null);
}

// ─── ACTIVITY LOGGING ─────────────────────────────────
export function logActivity(type, details, activityLog = []) {
  const entry = {
    id: `log-${Date.now()}`,
    type,
    details,
    timestamp: new Date().toISOString(),
    readableTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  return [entry, ...activityLog].slice(0, 500);
}

// ─── BROWSER NOTIFICATIONS ───────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

export function sendBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  return new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  });
}

// ─── DATA EXPORT ──────────────────────────────────────
export function exportAllData() {
  const data = storage.getAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexusai-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    Object.entries(data).forEach(([key, value]) => storage.set(key, value));
    return { success: true, keys: Object.keys(data).length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── API ABSTRACTION LAYER ────────────────────────────
// Ready for backend integration — swap implementations when connecting real API
export const api = {
  async getTasks() { return storage.get('app_state')?.tasks || []; },
  async saveTasks(tasks) { const state = storage.get('app_state') || {}; state.tasks = tasks; storage.set('app_state', state); },
  async getUser() { return storage.get('user', null); },
  async saveUser(user) { storage.set('user', user); },
  async getFocusSessions() { return storage.get('app_state')?.focusSessions || []; },
  async saveFocusSession(session) {
    const state = storage.get('app_state') || {};
    state.focusSessions = [...(state.focusSessions || []), session];
    storage.set('app_state', state);
  },
};

// ─── SERVICE WORKER REGISTRATION (PWA) ────────────────
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}
