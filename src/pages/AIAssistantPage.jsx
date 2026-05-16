import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bot, Send, Sparkles, Brain, Lightbulb, Clock, Target, Mic, Paperclip, Copy, ThumbsUp, ThumbsDown, ListTodo, Shield, Calendar, TrendingUp } from 'lucide-react';

const suggestions = [
  { icon: Brain, text: 'Analyze my productivity this week' },
  { icon: Target, text: 'What should I focus on today?' },
  { icon: Clock, text: 'When are my best work hours?' },
  { icon: Shield, text: 'Am I at risk of burnout?' },
  { icon: ListTodo, text: 'Prioritize my pending tasks' },
  { icon: Calendar, text: 'Generate my daily schedule' },
  { icon: Lightbulb, text: 'Give me productivity tips' },
  { icon: TrendingUp, text: 'Show my work patterns' },
];

export default function AIAssistantPage() {
  const { tasks, habits, aiInsights, addTask, parseNaturalLanguageTask } = useApp();
  const { score, burnout, focus, prioritized, summary, procrastination, workPatterns, breaks, schedule, overdueRisks, smartReminders } = aiInsights;

  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: `Hi Harsh! 👋 I'm your NexusAI productivity assistant.\n\nYour current productivity score is **${score.overall}%** (${score.level.label} ${score.level.emoji}).\n${summary.headline}\n\nHow can I help you today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const getSmartReply = (msg) => {
    const l = msg.toLowerCase();

    // Productivity Analysis
    if (l.includes('analy') || l.includes('productivity') || l.includes('score') || l.includes('performance')) {
      const { taskScore, focusScore, habitScore, consistencyScore } = score.breakdown;
      return `**📊 Productivity Analysis**\n\n• Overall Score: **${score.overall}%** ${score.level.emoji}\n• Task Completion: ${taskScore}%\n• Focus Quality: ${focusScore}%\n• Habit Consistency: ${habitScore}%\n• Daily Consistency: ${consistencyScore}%\n\n**Trend:** ${score.trend.direction === 'up' ? '📈 Up' : score.trend.direction === 'down' ? '📉 Down' : '➡️ Stable'} ${score.trend.percentage}% vs last week\n\n${summary.insights.join('\n')}`;
    }

    // Focus / Best work hours
    if (l.includes('focus') || l.includes('hour') || l.includes('best time') || l.includes('work hour') || l.includes('when')) {
      const peak = focus.peakHours[0];
      const recs = focus.recommendations.map(r => `• ${r.message}`).join('\n');
      return `**⏰ Optimal Work Hours**\n\n🟢 **Peak:** ${peak.start}:00–${peak.end}:00 (${peak.quality}% focus quality)\n🟡 **Secondary:** ${focus.peakHours[1]?.start || 14}:00–${focus.peakHours[1]?.end || 16}:00\n\n**Stats:**\n• Avg Session: ${focus.avgSessionLength} min\n• Deep Work Ratio: ${focus.deepWorkRatio}%\n• Distraction Score: ${focus.distractionScore}%\n\n**Recommendations:**\n${recs}`;
    }

    // Burnout
    if (l.includes('burnout') || l.includes('stress') || l.includes('overwhelm') || l.includes('tired')) {
      const indicators = burnout.indicators.map(i => `• ⚠️ ${i.message}`).join('\n');
      return `**🛡️ Burnout Assessment**\n\n• Risk Level: **${burnout.level.toUpperCase()}** (${burnout.riskScore}%)\n• Status: ${burnout.recommendation.title}\n\n${indicators ? `**Warning Signs:**\n${indicators}\n\n` : ''}**Recommendation:**\n${burnout.recommendation.message}\n\n${breaks.length ? `**Suggested Breaks:**\n${breaks.map(b => `${b.emoji} ${b.activity}`).join('\n')}` : ''}`;
    }

    // Prioritize tasks
    if (l.includes('priorit') || l.includes('what should') || l.includes('focus on') || l.includes('important') || l.includes('next')) {
      const top5 = prioritized.slice(0, 5);
      const list = top5.map((t, i) => `${i + 1}. **${t.title}** — ${t.aiReason} (${t.aiScore}% urgency)`).join('\n');
      return `**🎯 AI-Prioritized Tasks**\n\n${list}\n\n💡 **Tip:** Start with #1 during your ${focus.peakHours[0]?.start || 9}:00 AM peak window for maximum impact.`;
    }

    // Daily schedule
    if (l.includes('schedule') || l.includes('daily plan') || l.includes('today')) {
      const slots = schedule.slice(0, 10).map(s => `${s.time} — ${s.title} (${s.duration}min) ${s.type === 'break' ? '☕' : s.type === 'task' ? '📋' : s.type === 'event' ? '📅' : '📝'}`).join('\n');
      return `**📅 AI-Generated Daily Schedule**\n\n${slots}\n\n_Optimized based on your focus patterns and task priorities._`;
    }

    // Procrastination
    if (l.includes('procrastinat') || l.includes('stuck') || l.includes('not productive') || l.includes('lazy')) {
      const signs = procrastination.signs.map(s => `• ${s.message}`).join('\n');
      const tips = procrastination.tips.map(t => `• ${t}`).join('\n');
      return `**🔍 Procrastination Check**\n\nLevel: **${procrastination.level.toUpperCase()}** (${procrastination.score}%)\n\n${signs ? `**Signs Detected:**\n${signs}\n\n` : ''}**Tips:**\n${tips}`;
    }

    // Work patterns
    if (l.includes('pattern') || l.includes('habit') || l.includes('trend') || l.includes('insight')) {
      const patterns = workPatterns.patterns.map(p => `${p.type === 'positive' ? '✅' : '⚠️'} ${p.insight}`).join('\n');
      return `**📈 Work Pattern Analysis**\n\n• Most Productive Day: **${workPatterns.mostProductiveDay}**\n• Peak Hour: **${workPatterns.mostProductiveHour}**\n• Avg Tasks/Day: **${workPatterns.avgTasksPerDay}**\n• Avg Focus: **${workPatterns.avgFocusPerDay}**\n• Completion Rate: **${workPatterns.completionRate}%**\n\n**Insights:**\n${patterns}`;
    }

    // Overdue / at risk
    if (l.includes('overdue') || l.includes('risk') || l.includes('deadline') || l.includes('late')) {
      if (overdueRisks.length === 0) return '✅ **All tasks are on track!** No overdue or at-risk items detected.';
      const list = overdueRisks.slice(0, 5).map(t => `• **${t.title}** — ${t.riskLevel} risk (${t.daysLeft > 0 ? `${Math.round(t.daysLeft)}d left` : 'OVERDUE'}) → ${t.suggestion}`).join('\n');
      return `**⏰ At-Risk Tasks**\n\n${list}`;
    }

    // Reminders
    if (l.includes('remind') || l.includes('upcoming') || l.includes('notification')) {
      if (smartReminders.length === 0) return '✅ No pending reminders. You\'re all caught up!';
      const list = smartReminders.slice(0, 5).map(r => `• ${r.title}`).join('\n');
      return `**🔔 Smart Reminders**\n\n${list}`;
    }

    // Add task via natural language
    if (l.includes('add task') || l.includes('create task') || l.includes('new task')) {
      const taskText = msg.replace(/^(add|create|new)\s*task\s*/i, '').trim();
      if (taskText) {
        const parsed = parseNaturalLanguageTask(taskText);
        addTask(parsed);
        return `✅ **Task Created!**\n\n• Title: ${parsed.title}\n• Category: ${parsed.category}\n• Priority: ${parsed.priority}\n• Deadline: ${parsed.deadline || 'Not set'}\n${parsed.tags.length ? `• Tags: ${parsed.tags.join(', ')}` : ''}\n\n_Auto-categorized and prioritized by AI._`;
      }
      return 'What task would you like to add? You can type naturally, like:\n\n"Add task Fix login bug urgent by 2026-05-20 #backend"';
    }

    // Tips
    if (l.includes('tip') || l.includes('suggest') || l.includes('advice') || l.includes('help')) {
      return `**💡 Productivity Tips**\n\n1. Schedule deep work during your **${focus.peakHours[0]?.start || 9}–${focus.peakHours[0]?.end || 11} AM** peak\n2. Use the 2-minute rule: if it takes less than 2 min, do it now\n3. Batch similar tasks to reduce context switching\n4. Take a break every 90 minutes\n5. Review and plan tomorrow before ending your day\n6. Keep your task list under 10 active items\n\n${burnout.level !== 'low' ? '⚠️ Your burnout risk is elevated — consider lightening your load.' : '✅ Your workload balance looks healthy.'}`;
    }

    // Default intelligent response
    return `Here's a quick summary:\n\n• **Score:** ${score.overall}% ${score.level.emoji}\n• **Pending:** ${tasks.filter(t => t.status !== 'done').length} tasks\n• **Top Priority:** ${prioritized[0]?.title || 'None'}\n• **Burnout Risk:** ${burnout.level}\n\nI can help with:\n• "Analyze my productivity"\n• "What should I focus on today?"\n• "Generate my daily schedule"\n• "Am I at risk of burnout?"\n• "Add task <description>"\n\nWhat would you like to know?`;
  };

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: getSmartReply(msg), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800 + Math.random() * 600);
  };

  // Format text with bold markers
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-medium">$1</strong>');
      const italic = formatted.replace(/_(.*?)_/g, '<em class="text-text-muted">$1</em>');
      return <p key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: italic || '&nbsp;' }} />;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 lg:px-8 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center"><Bot size={16} className="text-white" /></div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary">AI Assistant</h1>
          <p className="text-[11px] text-text-muted">Powered by NexusAI Engine</p>
        </div>
        <span className="badge-green ml-1">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-5 space-y-4">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${msg.role === 'ai' ? 'bg-surface-300' : 'bg-accent-blue/10'}`}>
              {msg.role === 'ai' ? <Sparkles size={13} className="text-accent-blue" /> : '🧑‍💻'}
            </div>
            <div className="max-w-[75%]">
              <div className={`px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${msg.role === 'ai' ? 'bg-surface-200 border border-border text-text-secondary' : 'bg-accent-blue/10 border border-accent-blue-border text-text-primary'}`}>
                <div className="whitespace-pre-wrap space-y-0.5">{formatText(msg.text)}</div>
              </div>
              <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <span className="text-[10px] text-text-muted">{msg.time}</span>
                {msg.role === 'ai' && (
                  <div className="flex gap-0.5">
                    {[Copy, ThumbsUp, ThumbsDown].map((Icon, i) => (
                      <button key={i} className="p-0.5 text-text-muted hover:text-text-secondary"><Icon size={10} /></button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-md bg-surface-300 flex items-center justify-center"><Sparkles size={13} className="text-accent-blue" /></div>
            <div className="bg-surface-200 border border-border px-3.5 py-2.5 rounded-xl flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-5 lg:px-8 pb-3 grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s.text)} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-100 border border-border hover:border-border-hover text-left text-xs text-text-secondary transition-colors">
              <s.icon size={13} className="text-text-muted flex-shrink-0" /> <span className="truncate">{s.text}</span>
            </button>
          ))}
        </div>
      )}

      <div className="px-5 lg:px-8 py-3 border-t border-border flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything or type 'add task ...' to create tasks..." className="input flex-1 !py-2" />
        <button onClick={() => send()} className={`p-2 rounded-lg transition-colors ${input.trim() ? 'bg-accent-blue text-white' : 'text-text-muted bg-surface-300'}`}><Send size={16} /></button>
      </div>
    </div>
  );
}
