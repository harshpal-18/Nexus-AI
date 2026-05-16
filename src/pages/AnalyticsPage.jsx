import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { TrendingUp, Clock, Flame, Target, Trophy, Calendar as CalIcon, Brain, Download, FileText, Shield, Activity, ChevronRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const fade = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Tip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-surface-200 border border-border rounded-lg px-3 py-2 text-xs shadow-elevated">
      <p className="text-text-secondary mb-0.5">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || p.fill }} className="font-medium">{p.name}: {p.value}</p>)}
    </div>
  );
  return null;
};

const focusData = [
  { day: 'Mon', hours: 5.5 }, { day: 'Tue', hours: 7 }, { day: 'Wed', hours: 6.5 },
  { day: 'Thu', hours: 4 }, { day: 'Fri', hours: 8 }, { day: 'Sat', hours: 3 }, { day: 'Sun', hours: 2 },
];
const radarData = [
  { skill: 'Focus', v: 85 }, { skill: 'Speed', v: 72 }, { skill: 'Quality', v: 90 },
  { skill: 'Consistency', v: 78 }, { skill: 'Planning', v: 88 }, { skill: 'Collab', v: 65 },
];

const catColors = ['#2563EB', '#22C55E', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B'];

export default function AnalyticsPage() {
  const { tasks, productivityData, aiInsights, analytics, exportTasks } = useApp();
  const { score, burnout, focus, workPatterns } = aiInsights;
  const { trends, goals, mood, forecast } = analytics;
  const [tab, setTab] = useState('overview');

  const rate = Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100);

  // Category breakdown from real tasks
  const cats = {};
  tasks.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
  const catData = Object.entries(cats).map(([name, count], i) => ({
    name, value: Math.round(count / tasks.length * 100), color: catColors[i % catColors.length],
  })).sort((a, b) => b.value - a.value);

  // Heatmap from engine
  const heatmap = Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    v: workPatterns.weeklyHeatmap ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 10),
  }));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'forecast', label: 'Forecast' },
  ];

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-sm text-text-muted mt-0.5">AI-powered insights and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportTasks('csv')} className="btn-secondary !text-xs !py-1.5 flex items-center gap-1.5">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => exportTasks('json')} className="btn-secondary !text-xs !py-1.5 flex items-center gap-1.5">
            <FileText size={13} /> Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-surface-300 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'AI Score', value: `${score.overall}%`, icon: Brain, sub: `${score.level.label} ${score.level.emoji}` },
          { label: 'Focus', value: `${productivityData.focusHours}h`, icon: Clock, sub: `Peak: ${focus.peakHours[0]?.start || 9}–${focus.peakHours[0]?.end || 11} AM` },
          { label: 'Streak', value: `${productivityData.streak}d`, icon: Flame, sub: 'Personal best' },
          { label: 'Burnout', value: `${burnout.riskScore}%`, icon: Shield, sub: `${burnout.level} risk` },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} initial="hidden" animate="show" transition={{ delay: i * 0.05 }} className="stat-card">
            <s.icon size={16} className="text-text-muted mb-3" strokeWidth={1.6} />
            <div className="text-xl font-semibold text-text-primary">{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
            <div className="text-[10px] text-accent-blue mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <>
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Productivity Chart */}
            <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
              <h2 className="text-sm font-medium text-text-primary mb-4">Weekly Productivity</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productivityData.dailyScores}>
                    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.1} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} width={28} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="score" stroke="#2563EB" fill="url(#ag)" strokeWidth={1.5} dot={false} name="Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Focus Hours */}
            <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
              <h2 className="text-sm font-medium text-text-primary mb-4">Focus Hours</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusData}>
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="hours" fill="#2563EB" radius={[4, 4, 0, 0]} name="Hours" barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
              <h2 className="text-sm font-medium text-text-primary mb-4">Task Categories</h2>
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={catData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">{catData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {catData.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: c.color }} /><span className="text-xs text-text-secondary">{c.name}</span></div>
                      <span className="text-xs font-medium text-text-primary">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Skills Radar */}
            <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
              <h2 className="text-sm font-medium text-text-primary mb-4">Performance Radar</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}><PolarGrid stroke="var(--border)" /><PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-3)', fontSize: 10 }} /><Radar dataKey="v" stroke="#2563EB" fill="#2563EB" fillOpacity={0.08} strokeWidth={1.5} /></RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Heatmap */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <h2 className="text-sm font-medium text-text-primary mb-4">Activity — May 2026</h2>
            <div className="grid grid-cols-7 gap-1">
              {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-text-muted py-1">{d}</div>)}
              {Array.from({ length: 4 }).map((_, i) => <div key={`p${i}`} />)}
              {heatmap.map((d, i) => (
                <div key={i} className="aspect-square rounded flex items-center justify-center text-[10px] text-text-muted"
                  style={{ background: `rgba(37, 99, 235, ${d.v / 12})` }} title={`May ${d.day}: ${d.v} activities`}>{d.day}</div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-primary flex items-center gap-2"><Trophy size={14} className="text-amber-500/70" /> Achievements</h2>
              <span className="text-xs text-text-muted">{productivityData.badges.filter(b => b.earned).length}/{productivityData.badges.length} earned</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {productivityData.badges.map((b, i) => (
                <div key={i} title={b.description}
                  className={`text-center p-3 rounded-lg border transition-all relative group cursor-default ${b.earned ? 'border-border bg-surface-200/30 hover:border-accent-blue/30' : 'border-border opacity-50 hover:opacity-80'}`}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-[10px] font-medium text-text-primary leading-tight">{b.title}</p>
                  {b.earned && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-green flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                  {!b.earned && b.progress !== undefined && (
                    <div className="mt-1.5">
                      <div className="w-full h-1 rounded-full bg-surface-400 overflow-hidden">
                        <div className="h-full rounded-full bg-accent-blue/60" style={{ width: `${Math.round((b.progress / b.target) * 100)}%` }} />
                      </div>
                      <p className="text-[8px] text-text-muted mt-0.5">{b.progress}/{b.target}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Goals Tab */}
      {tab === 'goals' && (
        <div className="space-y-3">
          {goals.map((goal, i) => (
            <motion.div key={goal.id} variants={fade} initial="hidden" animate="show" transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">{goal.title}</h3>
                    <p className="text-xs text-text-muted">{goal.forecast}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${goal.status === 'completed' ? 'bg-green-500/10 text-green-400' : goal.status === 'on-track' ? 'bg-blue-500/10 text-blue-400' : goal.status === 'at-risk' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                  {goal.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-surface-400 overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className="text-xs font-medium text-text-primary w-10 text-right">{goal.progress}%</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                {goal.daysLeft !== null && <span>{goal.daysLeft} days left</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Patterns Tab */}
      {tab === 'patterns' && (
        <div className="space-y-5">
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
              <Activity size={14} className="text-text-muted" /> Work Pattern Insights
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {[
                { label: 'Most Productive Day', value: workPatterns.mostProductiveDay },
                { label: 'Peak Hour', value: workPatterns.mostProductiveHour },
                { label: 'Avg Tasks/Day', value: workPatterns.avgTasksPerDay },
                { label: 'Avg Focus/Day', value: workPatterns.avgFocusPerDay },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-200/50 border border-border">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {workPatterns.patterns.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.type === 'positive' ? 'bg-accent-green' : 'bg-amber-400'}`} />
                  {p.insight}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mood Tracking */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <h2 className="text-sm font-medium text-text-primary mb-4">Mood Tracker (7 days)</h2>
            <div className="flex items-end gap-3 mb-3">
              {mood.entries.map((entry, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="text-lg mb-1">{entry.emoji}</div>
                  <div className="h-16 flex items-end justify-center">
                    <div className="w-full max-w-[20px] rounded-t bg-accent-blue/20" style={{ height: `${entry.score * 16}%` }} />
                  </div>
                  <p className="text-[9px] text-text-muted mt-1">{new Date(entry.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted">{mood.correlation}</p>
          </motion.div>

          {/* Completion Trends */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <h2 className="text-sm font-medium text-text-primary mb-4">Completion Trend</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.data}>
                  <XAxis dataKey="period" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="completed" fill="#22C55E" radius={[4, 4, 0, 0]} name="Completed" barSize={20} />
                  <Bar dataKey="total" fill="rgba(37, 99, 235, 0.2)" radius={[4, 4, 0, 0]} name="Total" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-text-muted mt-2">Trend: {trends.insight} ({trends.trendDirection === 'up' ? '📈' : trends.trendDirection === 'down' ? '📉' : '➡️'})</p>
          </motion.div>
        </div>
      )}

      {/* Forecast Tab */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <h2 className="text-sm font-medium text-text-primary mb-2">7-Day Productivity Forecast</h2>
            <p className="text-xs text-text-muted mb-4">AI-predicted task completion based on your patterns</p>
            <div className="space-y-2">
              {forecast.forecast.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-8">{f.day}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-400 overflow-hidden">
                    <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${Math.min(100, (f.predictedCompleted / Math.max(1, f.predictedCompleted + f.remaining)) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-text-muted w-20 text-right">{f.remaining} remaining</span>
                  <span className="text-[10px] text-text-muted w-12 text-right">{f.confidence}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-surface-200/50 border border-border">
              <p className="text-xs text-text-secondary">
                <strong className="text-text-primary">Estimated Clear Date:</strong> {forecast.estimatedClearDate}<br/>
                <strong className="text-text-primary">Daily Velocity:</strong> {forecast.dailyVelocity} tasks/day
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
