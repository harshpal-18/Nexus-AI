import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2, Calendar, BarChart3, Bot, Users, Bell, Sparkles, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  { icon: CheckCircle2, title: 'Smart Task Management', desc: 'AI-powered task creation, Kanban boards, and deadline tracking.' },
  { icon: Calendar, title: 'Calendar Integration', desc: 'Sync with Google, Outlook & Apple Calendar with conflict detection.' },
  { icon: BarChart3, title: 'Productivity Analytics', desc: 'Deep insights with heatmaps, streaks, and AI-generated reports.' },
  { icon: Bot, title: 'AI Assistant', desc: 'Natural language task input, smart suggestions, and burnout detection.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Shared workspaces, real-time collaboration, and team analytics.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Multi-channel notifications with AI-optimized timing.' },
];

function Fade({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${scrolled ? 'bg-surface-50/80 backdrop-blur-md border-b border-border' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between relative">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-blue flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-text-primary">NexusAI</span>
          </div>

          {/* Center nav links — absolutely centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
            <a href="#features" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">Features</a>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            </button>
            <button onClick={() => navigate('/auth')} className="btn-ghost text-sm">Sign In</button>
            <button onClick={() => navigate('/auth')} className="btn-primary !text-sm !py-1.5">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue-soft border border-accent-blue-border text-accent-blue text-xs font-medium mb-6">
              <Sparkles size={12} /> AI-Powered Productivity
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold text-text-primary leading-[1.15] tracking-tight mb-5">
              The smarter way to<br />manage your work
            </h1>
            <p className="text-base sm:text-lg text-text-tertiary max-w-xl mx-auto mb-8 leading-relaxed">
              AI-powered task management, calendar sync, and productivity insights — all in one calm, focused workspace.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/auth')} className="btn-primary !py-2.5 !px-6 flex items-center gap-2">
                Get Started Free <ArrowRight size={16} />
              </button>
              <a href="#features" className="btn-secondary !py-2.5 !px-6 inline-block">Learn More</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ v: '50K+', l: 'Active Users' }, { v: '2M+', l: 'Tasks Completed' }, { v: '99.9%', l: 'Uptime' }, { v: '4.9★', l: 'Rating' }].map((s, i) => (
            <Fade key={i} delay={i * 0.05}>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">{s.v}</div>
                <div className="text-sm text-text-muted mt-1">{s.l}</div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <Fade>
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-3">Everything you need</h2>
              <p className="text-text-tertiary max-w-md mx-auto">Powerful tools designed for focused, productive work.</p>
            </div>
          </Fade>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Fade key={i} delay={i * 0.05}>
                <div className="card-hover p-5 h-full">
                  <f.icon size={20} className="text-text-muted mb-3" strokeWidth={1.6} />
                  <h3 className="text-sm font-medium text-text-primary mb-1.5">{f.title}</h3>
                  <p className="text-xs text-text-tertiary leading-relaxed">{f.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <Fade>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold text-text-primary tracking-tight mb-3">Ready to get started?</h2>
            <p className="text-text-tertiary mb-6">Join 50,000+ professionals using NexusAI.</p>
            <button onClick={() => navigate('/auth')} className="btn-primary !py-2.5 !px-6 inline-flex items-center gap-2">
              Start Free <ArrowRight size={16} />
            </button>
          </div>
        </Fade>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-blue flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-text-secondary">NexusAI</span>
          </div>
          <p className="text-xs text-text-muted">© 2026 NexusAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}