import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3, Bot, Users,
  Bell, Crosshair, Settings, User, LogOut, ChevronLeft, ChevronRight,
  Zap, Menu, X, Search, Plus, Command, Sun, Moon
} from 'lucide-react';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/app/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/app/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/app/focus', icon: Crosshair, label: 'Focus' },
  { path: '/app/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { path: '/app/workspace', icon: Users, label: 'Team' },
  { path: '/app/notifications', icon: Bell, label: 'Notifications' },
];

const bottomItems = [
  { path: '/app/settings', icon: Settings, label: 'Settings' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

export default function DashboardLayout() {
  const { user, logout, sidebarOpen, setSidebarOpen, notificationList, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notificationList.filter(n => !n.read).length;

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent-blue flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {(sidebarOpen || mobile) && (
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">NexusAI</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); mobile && setMobileMenuOpen(false); }}
              className={`nav-item w-full ${active ? 'active' : ''} ${!sidebarOpen && !mobile ? 'justify-center px-0' : ''}`}
              title={!sidebarOpen && !mobile ? item.label : ''}
            >
              <item.icon size={18} className="flex-shrink-0" strokeWidth={1.8} />
              {(sidebarOpen || mobile) && (
                <span className="truncate">{item.label}</span>
              )}
              {item.label === 'Notifications' && unreadCount > 0 && (sidebarOpen || mobile) && (
                <span className="ml-auto text-[10px] font-medium text-accent-blue bg-accent-blue-soft px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 py-3 border-t border-border space-y-0.5">
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); mobile && setMobileMenuOpen(false); }}
              className={`nav-item w-full ${active ? 'active' : ''} ${!sidebarOpen && !mobile ? 'justify-center px-0' : ''}`}
            >
              <item.icon size={18} className="flex-shrink-0" strokeWidth={1.8} />
              {(sidebarOpen || mobile) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className={`nav-item w-full text-red-400/70 hover:text-red-400 ${!sidebarOpen && !mobile ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" strokeWidth={1.8} />
          {(sidebarOpen || mobile) && <span className="truncate">Logout</span>}
        </button>
      </div>

      {/* User */}
      {(sidebarOpen || mobile) && (
        <div className="px-2.5 pb-3">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-200/50">
            <div className="w-7 h-7 rounded-full bg-surface-400 flex items-center justify-center text-xs">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col border-r border-border bg-surface-50 flex-shrink-0 relative transition-all duration-200"
        style={{ width: sidebarOpen ? 220 : 64 }}
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface-300 border border-border flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors z-10"
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[240px] bg-surface-50 border-r border-border z-50 lg:hidden"
            >
              <div className="flex items-center justify-end px-3 h-14">
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-text-muted">
                  <X size={18} />
                </button>
              </div>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-surface-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-text-muted">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="input pl-9 !py-1.5 !text-[13px] w-[240px] lg:w-[300px]"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-text-muted">
                  <kbd className="text-[10px] px-1 py-0.5 rounded bg-surface-300 border border-border font-mono">⌘</kbd>
                  <kbd className="text-[10px] px-1 py-0.5 rounded bg-surface-300 border border-border font-mono">K</kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button className="btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5">
              <Plus size={14} /> New Task
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-muted hover:text-text-secondary transition-all"
              style={{ background: 'var(--hover-bg)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            </button>
            <button
              onClick={() => navigate('/app/notifications')}
              className="relative p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-200/50 transition-all"
            >
              <Bell size={18} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-blue" />
              )}
            </button>
            <button
              onClick={() => navigate('/app/profile')}
              className="w-8 h-8 rounded-full bg-surface-400 flex items-center justify-center text-sm ml-1"
            >
              {user.avatar}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
