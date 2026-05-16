import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function AIChatbot() {
  const { aiChatOpen, setAiChatOpen, aiInsights, tasks, addTask, parseNaturalLanguageTask } = useApp();
  const { score, burnout, prioritized, summary, focus } = aiInsights;

  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: `Hi! Score: ${score.overall}% ${score.level.emoji}. How can I help?` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const getSmartReply = (msg) => {
    const l = msg.toLowerCase();

    if (l.includes('add task') || l.includes('create task')) {
      const text = msg.replace(/^(add|create)\s*task\s*/i, '').trim();
      if (text) { addTask(text); return `✅ Task "${text}" created!`; }
      return 'What task should I add?';
    }
    if (l.includes('score') || l.includes('productivity')) return `Score: ${score.overall}% (${score.level.label})\nTask: ${score.breakdown.taskScore}% · Focus: ${score.breakdown.focusScore}%`;
    if (l.includes('burnout') || l.includes('stress')) return `Burnout: ${burnout.level} (${burnout.riskScore}%)\n${burnout.recommendation.message}`;
    if (l.includes('priority') || l.includes('focus') || l.includes('next')) {
      const top = prioritized.slice(0, 3).map((t, i) => `${i + 1}. ${t.title}`).join('\n');
      return `Top priorities:\n${top}`;
    }
    if (l.includes('tip') || l.includes('suggest')) return `💡 ${focus.recommendations[0]?.message || 'Schedule deep work during morning hours for best results.'}`;
    if (l.includes('stat') || l.includes('summary')) return summary.insights.join('\n');
    return `I can help with: tasks, scores, burnout, priorities, tips. What do you need?`;
  };

  const send = (text) => {
    const msg = text || input.trim(); if (!msg) return;
    setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }]);
    setInput(''); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: getSmartReply(msg) }]);
    }, 600);
  };

  return (
    <>
      <AnimatePresence>{!aiChatOpen && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          onClick={() => setAiChatOpen(true)}
          className="fixed bottom-5 right-5 w-11 h-11 rounded-full bg-accent-blue flex items-center justify-center z-40 shadow-elevated hover:bg-accent-blue-light transition-colors">
          <MessageSquare size={18} className="text-white" />
        </motion.button>
      )}</AnimatePresence>

      <AnimatePresence>{aiChatOpen && (
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.95 }}
          className="fixed bottom-5 right-5 w-[320px] h-[420px] card flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
            <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-accent-blue flex items-center justify-center"><Sparkles size={11} className="text-white" /></div><span className="text-xs font-semibold text-text-primary">NexusAI</span></div>
            <button onClick={() => setAiChatOpen(false)} className="text-text-muted hover:text-text-secondary"><X size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'ai' ? 'bg-surface-200 border border-border text-text-secondary' : 'bg-accent-blue-soft border border-accent-blue-border text-text-primary'}`}>{msg.text}</div>
              </div>
            ))}
            {typing && <div className="flex gap-1 px-3 py-2 bg-surface-200 border border-border rounded-lg w-fit">{[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2.5 border-t border-border flex gap-1.5">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask or 'add task ...'" className="input flex-1 !py-1.5 !text-xs" />
            <button onClick={() => send()} className={`p-1.5 rounded-md ${input.trim() ? 'bg-accent-blue text-white' : 'text-text-muted bg-surface-300'}`}><Send size={13} /></button>
          </div>
        </motion.div>
      )}</AnimatePresence>
    </>
  );
}
