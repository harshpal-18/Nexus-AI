import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bell, Bot, Trophy, Users, Settings, CheckCheck, Trash2, Clock } from 'lucide-react';

const typeCfg = {
  reminder: { icon: Clock, color: '#EF4444', label: 'Reminder' },
  ai: { icon: Bot, color: '#2563EB', label: 'AI' },
  achievement: { icon: Trophy, color: '#F59E0B', label: 'Achievement' },
  team: { icon: Users, color: '#22C55E', label: 'Team' },
  system: { icon: Settings, color: '#8B5CF6', label: 'System' },
};

export default function NotificationsPage() {
  const { notificationList, markNotificationRead, setNotificationList } = useApp();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? notificationList : filter === 'unread' ? notificationList.filter(n => !n.read) : notificationList.filter(n => n.type === filter);
  const unread = notificationList.filter(n => !n.read).length;

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-xl font-semibold text-text-primary tracking-tight">Notifications {unread > 0 && <span className="text-sm font-normal text-text-muted">({unread})</span>}</h1></div>
        <div className="flex gap-2">
          <button onClick={() => setNotificationList(p => p.map(n => ({ ...n, read: true })))} className="btn-secondary !py-1.5 !text-xs flex items-center gap-1.5"><CheckCheck size={13} /> Mark all read</button>
          <button onClick={() => setNotificationList([])} className="btn-ghost !text-xs text-text-muted"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {['all', 'unread', 'reminder', 'ai', 'achievement', 'team'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs capitalize ${filter === f ? 'bg-surface-300 text-text-primary' : 'text-text-muted'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-1.5">
        {filtered.length > 0 ? filtered.map((n, i) => {
          const cfg = typeCfg[n.type]; const Icon = cfg.icon;
          return (
            <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              onClick={() => markNotificationRead(n.id)} className={`card-hover p-4 flex items-start gap-3 cursor-pointer ${!n.read ? 'border-l-2' : ''}`} style={!n.read ? { borderLeftColor: cfg.color } : {}}>
              <Icon size={16} className="text-text-muted flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>{n.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-text-muted">{n.time}</span>
                  <span className="tag !text-[10px]">{cfg.label}</span>
                </div>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.color }} />}
            </motion.div>
          );
        }) : <div className="text-center py-16"><Bell size={32} className="text-text-muted mx-auto mb-2" /><p className="text-sm text-text-muted">All caught up</p></div>}
      </div>
    </div>
  );
}
