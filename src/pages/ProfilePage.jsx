import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Edit3, Camera, Zap, CheckCircle2, Flame, TrendingUp, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, tasks, productivityData } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const done = tasks.filter(t => t.status === 'done').length;
  const xpNext = (productivityData.level + 1) * 500;
  const xpPct = (productivityData.totalXP / xpNext) * 100;
  const save = () => { setUser(p => ({ ...p, ...form })); setEditing(false); };

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-surface-400 flex items-center justify-center text-2xl">{user.avatar}</div>
            <button className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera size={16} className="text-white" /></button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-lg font-semibold text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-muted">{user.email}</p>
            <div className="flex gap-2 mt-2 justify-center sm:justify-start"><span className="badge-blue">{user.role}</span><span className="tag">{user.joinDate}</span></div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary !py-1.5 !text-xs flex items-center gap-1.5"><Edit3 size={13} /> Edit</button>
        </div>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 pt-5 border-t border-border">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-text-muted mb-1 block">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="text-xs text-text-muted mb-1 block">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
            </div>
            <div className="flex gap-2 mt-3"><button onClick={save} className="btn-primary !py-1.5 !text-xs">Save</button><button onClick={() => setEditing(false)} className="btn-secondary !py-1.5 !text-xs">Cancel</button></div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Level', value: productivityData.level, icon: Award, sub: 'Rank' },
          { label: 'XP', value: productivityData.totalXP.toLocaleString(), icon: Zap, sub: `${xpNext - productivityData.totalXP} to next` },
          { label: 'Completed', value: done, icon: CheckCircle2, sub: `of ${tasks.length}` },
          { label: 'Streak', value: `${productivityData.streak}d`, icon: Flame, sub: 'Keep going' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <s.icon size={16} className="text-text-muted mb-2" strokeWidth={1.6} />
            <div className="text-xl font-semibold text-text-primary">{s.value}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
            <div className="text-[10px] text-accent-blue mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-muted">Level {productivityData.level}</span><span className="text-xs text-text-muted">{productivityData.totalXP}/{xpNext} XP</span></div>
        <div className="w-full h-1.5 rounded-full bg-surface-400 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-accent-blue" />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2"><Award size={14} className="text-amber-500/70" /> Badges</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {productivityData.badges.map((b, i) => (
            <div key={i} className={`text-center p-2.5 rounded-lg border ${b.earned ? 'border-border bg-surface-200/30' : 'border-border opacity-25'}`}>
              <div className="text-lg mb-0.5">{b.icon}</div>
              <p className="text-[10px] font-medium text-text-primary">{b.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
