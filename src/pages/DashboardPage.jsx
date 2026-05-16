import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2, Clock, ListTodo, TrendingUp, ArrowUpRight, ArrowDownRight,
  Plus, ChevronRight, Brain, Flame, Calendar as CalIcon, Sparkles, Circle,
  AlertTriangle, Zap, Target, Activity, Shield
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fade = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-200 border border-border rounded-lg px-3 py-2 text-xs shadow-elevated">
        <p className="text-text-secondary mb-0.5">{label}</p>
        <p className="text-text-primary font-medium">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { tasks, habits, toggleHabit, productivityData, calendarEvents, aiInsights, completeTask } = useApp();
  const navigate = useNavigate();

  const { score, burnout, focus, prioritized, summary, overdueRisks } = aiInsights;

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const todayTasks = prioritized.slice(0, 5);
  const todayEvents = calendarEvents.filter(e => e.date === '2026-05-13').slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const stats = [
    { label: 'Completed', value: doneCount, icon: CheckCircle2, change: `+${doneCount}`, up: true },
    { label: 'Focus Time', value: `${productivityData.focusHours}h`, icon: Clock, change: '+1.2h', up: true },
    { label: 'Pending', value: todoCount + tasks.filter(t => t.status === 'in-progress').length, icon: ListTodo, change: `-${doneCount}`, up: false },
    { label: 'AI Score', value: `${score.overall}%`, icon: TrendingUp, change: `${score.trend.direction === 'up' ? '+' : ''}${score.trend.percentage}%`, up: score.trend.direction === 'up' },
  ];

  const priorityColors = { high: 'badge-red', medium: 'badge-amber', low: 'badge-blue' };
  const burnoutColor = burnout.level === 'high' ? 'text-red-400' : burnout.level === 'moderate' ? 'text-amber-400' : 'text-accent-green';
  const burnoutBg = burnout.level === 'high' ? 'bg-red-500/5 border-red-500/10' : burnout.level === 'moderate' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-green-500/5 border-green-500/10';

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Welcome + Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">{greeting}, Harsh</h1>
          <p className="text-sm text-text-tertiary mt-0.5">{summary.headline}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg mr-1">{score.level.emoji}</span>
          <span className="text-xs text-text-muted">{score.level.label}</span>
          <span className="text-xs text-text-muted">·</span>
          <p className="text-xs text-text-muted">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' })}</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} variants={fade} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <s.icon size={18} className="text-text-muted" strokeWidth={1.6} />
              <div className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-accent-green' : 'text-accent-red'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.change}
              </div>
            </div>
            <div className="text-2xl font-semibold text-text-primary tracking-tight">{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main: Chart + Tasks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-medium text-text-primary">Productivity</h2>
                <p className="text-xs text-text-muted mt-0.5">Weekly overview</p>
              </div>
              <span className="badge-blue">{score.overall}%</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productivityData.dailyScores}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#2563EB" fill="url(#scoreGrad)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#2563EB', stroke: 'var(--bg)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI-Prioritized Tasks */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-accent-blue" />
                <h2 className="text-sm font-medium text-text-primary">AI-Prioritized Tasks</h2>
              </div>
              <button onClick={() => navigate('/app/tasks')} className="btn-ghost !text-xs flex items-center gap-1">View all <ChevronRight size={14} /></button>
            </div>
            <div className="space-y-1">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200/40 transition-colors group">
                  <button onClick={() => completeTask(task.id)} className="w-[18px] h-[18px] rounded-full border-[1.5px] border-text-muted flex-shrink-0 flex items-center justify-center hover:border-accent-green transition-colors">
                    {task.status === 'done' && <CheckCircle2 size={14} className="text-accent-green" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{task.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {task.category} {task.deadline && `· Due ${task.deadline.slice(5)}`}
                      {task.aiReason && <span className="text-accent-blue ml-1">· {task.aiReason}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.estimatedMinutes && (
                      <span className="text-[10px] text-text-muted hidden sm:inline">{task.estimatedMinutes}m</span>
                    )}
                    <span className={`${priorityColors[task.priority]} hidden sm:inline-flex`}>{task.priority}</span>
                    {/* AI urgency indicator */}
                    <div className="w-6 h-1 rounded-full bg-surface-400 overflow-hidden hidden sm:block">
                      <div className="h-full rounded-full bg-accent-blue" style={{ width: `${task.aiScore}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/app/tasks')} className="btn-secondary w-full mt-3 flex items-center justify-center gap-1.5 !text-xs">
              <Plus size={14} /> Add Task
            </button>
          </motion.div>

          {/* Burnout + Overdue Risks */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Burnout Monitor */}
            <motion.div variants={fade} initial="hidden" animate="show" className={`rounded-xl p-4 border ${burnoutBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} className={burnoutColor} />
                <h3 className="text-xs font-medium text-text-primary">Burnout Monitor</h3>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xl font-semibold text-text-primary">{burnout.riskScore}%</div>
                <span className={`text-xs font-medium ${burnoutColor}`}>{burnout.level} risk</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">{burnout.recommendation.message}</p>
              {burnout.indicators.length > 0 && (
                <div className="mt-2 space-y-1">
                  {burnout.indicators.slice(0, 2).map((ind, i) => (
                    <div key={i} className="text-[10px] text-text-muted flex items-center gap-1">
                      <AlertTriangle size={9} className={ind.severity === 'high' ? 'text-red-400' : 'text-amber-400'} />
                      {ind.message}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Overdue Risks */}
            <motion.div variants={fade} initial="hidden" animate="show" className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-text-muted" />
                <h3 className="text-xs font-medium text-text-primary">At-Risk Tasks</h3>
              </div>
              {overdueRisks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary truncate">{task.title}</p>
                    <p className="text-[10px] text-text-muted">{task.suggestion}</p>
                  </div>
                  <div className={`text-[10px] font-medium ml-2 ${task.riskLevel === 'high' ? 'text-red-400' : task.riskLevel === 'medium' ? 'text-amber-400' : 'text-accent-green'}`}>
                    {task.riskScore}%
                  </div>
                </div>
              ))}
              {overdueRisks.length === 0 && <p className="text-xs text-text-muted text-center py-3">All tasks on track ✓</p>}
            </motion.div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Schedule */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-primary flex items-center gap-2">
                <CalIcon size={14} className="text-text-muted" /> Schedule
              </h2>
              <span className="text-xs text-text-muted">Today</span>
            </div>
            <div className="space-y-2.5">
              {todayEvents.length > 0 ? todayEvents.map(e => (
                <div key={e.id} className="flex items-start gap-3 py-2">
                  <div className="w-0.5 h-full min-h-[36px] rounded-full mt-0.5" style={{ background: e.color }} />
                  <div>
                    <p className="text-sm text-text-primary">{e.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{e.time} · {e.duration}min</p>
                  </div>
                </div>
              )) : <p className="text-sm text-text-muted text-center py-4">No events today</p>}
            </div>
          </motion.div>

          {/* AI Insight — Dynamic */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-accent-blue" />
              <h2 className="text-sm font-medium text-text-primary">AI Insight</h2>
            </div>
            <div className="space-y-2">
              {summary.insights.map((insight, i) => (
                <p key={i} className="text-[12px] text-text-secondary leading-relaxed">{insight}</p>
              ))}
            </div>
            {focus.recommendations?.[0] && (
              <div className="mt-3 p-2.5 rounded-lg bg-accent-blue/5 border border-accent-blue/10">
                <p className="text-[11px] text-accent-blue">{focus.recommendations[0].message}</p>
              </div>
            )}
            <button onClick={() => navigate('/app/analytics')} className="btn-ghost !text-xs mt-3 !px-0 text-accent-blue hover:text-accent-blue-light">
              View detailed analysis →
            </button>
          </motion.div>

          {/* Streak & Habits */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Flame size={14} className="text-amber-500/70" /> Streaks
              </h2>
              <span className="text-lg font-semibold text-text-primary">{productivityData.streak}<span className="text-xs text-text-muted font-normal ml-1">days</span></span>
            </div>
            <div className="space-y-1.5">
              {habits.slice(0, 4).map(h => (
                <button key={h.id} onClick={() => toggleHabit(h.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-200/40 transition-colors text-left">
                  <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${h.completedToday ? 'bg-accent-green/20 border-accent-green' : 'border-text-muted'}`}>
                    {h.completedToday && <CheckCircle2 size={10} className="text-accent-green" />}
                  </div>
                  <span className={`text-xs flex-1 truncate ${h.completedToday ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{h.title}</span>
                  <span className="text-[10px] text-text-muted">{h.streak}d</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Level */}
          <motion.div variants={fade} initial="hidden" animate="show" className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">Level {productivityData.level}</span>
              <span className="text-xs text-text-muted">{productivityData.totalXP} / {(productivityData.level + 1) * 500} XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-400 overflow-hidden">
              <div className="h-full rounded-full bg-accent-blue transition-all duration-500"
                style={{ width: `${(productivityData.totalXP / ((productivityData.level + 1) * 500)) * 100}%` }} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
