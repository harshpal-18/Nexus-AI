import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Coffee, Brain, Zap, Volume2, VolumeX, Flame, Clock, Settings, ChevronUp, ChevronDown, X, Check } from 'lucide-react';

const DEFAULT_MODES = [
  { id: 'focus', label: 'Focus', duration: 25, color: '#2563EB', icon: Brain },
  { id: 'short', label: 'Short Break', duration: 5, color: '#22C55E', icon: Coffee },
  { id: 'long', label: 'Long Break', duration: 15, color: '#8B5CF6', icon: Zap },
];
const sounds = [
  { id: 'none', label: 'None', emoji: '🔇' }, { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'forest', label: 'Forest', emoji: '🌲' }, { id: 'cafe', label: 'Café', emoji: '☕' },
];
const PRESETS = [
  { label: 'Classic', focus: 25, short: 5, long: 15 },
  { label: 'Deep Work', focus: 50, short: 10, long: 30 },
  { label: 'Sprint', focus: 15, short: 3, long: 10 },
  { label: 'Study', focus: 45, short: 10, long: 20 },
];

function DurationPicker({ value, onChange, min = 1, max = 120, label }) {
  const increment = () => onChange(Math.min(value + 1, max));
  const decrement = () => onChange(Math.max(value - 1, min));

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={decrement} className="w-6 h-6 rounded-md bg-surface-200 border border-border hover:border-border-hover flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors">
          <ChevronDown size={12} />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value) || min;
            onChange(Math.max(min, Math.min(v, max)));
          }}
          className="w-12 text-center bg-surface-200 border border-border rounded-md py-1 text-sm text-text-primary font-mono outline-none focus:border-accent-blue/40 transition-colors"
        />
        <button onClick={increment} className="w-6 h-6 rounded-md bg-surface-200 border border-border hover:border-border-hover flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors">
          <ChevronUp size={12} />
        </button>
        <span className="text-[10px] text-text-muted w-6">min</span>
      </div>
    </div>
  );
}

export default function FocusModePage() {
  const { tasks } = useApp();
  const [modes, setModes] = useState(DEFAULT_MODES);
  const [modeIndex, setModeIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MODES[0].duration * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [sound, setSound] = useState('none');
  const [focusTask, setFocusTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editDurations, setEditDurations] = useState({ focus: 25, short: 5, long: 15 });
  const ref = useRef(null);
  const active = tasks.filter(t => t.status !== 'done');
  const mode = modes[modeIndex];

  useEffect(() => {
    if (running && timeLeft > 0) {
      ref.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            clearInterval(ref.current);
            setRunning(false);
            if (mode.id === 'focus') setSessions(s => s + 1);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [running, timeLeft, mode]);

  const switchMode = (idx) => {
    setModeIndex(idx);
    setTimeLeft(modes[idx].duration * 60);
    setRunning(false);
  };

  const applyDurations = () => {
    const updated = modes.map(m => ({
      ...m,
      duration: m.id === 'focus' ? editDurations.focus : m.id === 'short' ? editDurations.short : editDurations.long,
    }));
    setModes(updated);
    setTimeLeft(updated[modeIndex].duration * 60);
    setRunning(false);
    setShowSettings(false);
  };

  const applyPreset = (preset) => {
    setEditDurations({ focus: preset.focus, short: preset.short, long: preset.long });
  };

  const openSettings = () => {
    setEditDurations({
      focus: modes.find(m => m.id === 'focus').duration,
      short: modes.find(m => m.id === 'short').duration,
      long: modes.find(m => m.id === 'long').duration,
    });
    setShowSettings(true);
  };

  const min = Math.floor(timeLeft / 60), sec = timeLeft % 60;
  const pct = ((mode.duration * 60 - timeLeft) / (mode.duration * 60)) * 100;
  const circ = 2 * Math.PI * 130;

  return (
    <div className="p-5 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Focus</h1>
          <p className="text-sm text-text-muted">Pomodoro technique</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openSettings}
            className="card px-3 py-1.5 flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
            <Settings size={13} />
            <span className="text-xs">Timer Settings</span>
          </button>
          <div className="card px-3 py-1.5 flex items-center gap-2">
            <Flame size={13} className="text-amber-500/70" />
            <span className="text-sm font-medium text-text-primary">{sessions}</span>
            <span className="text-xs text-text-muted">sessions</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="flex flex-col items-center">
          {/* Mode Tabs */}
          <div className="flex gap-1.5 mb-8">
            {modes.map((m, i) => (
              <button key={m.id} onClick={() => switchMode(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${modeIndex === i ? 'bg-surface-300 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                <m.icon size={13} /> {m.label}
                <span className="text-text-muted font-normal">({m.duration}m)</span>
              </button>
            ))}
          </div>

          {/* Timer Ring */}
          <div className="relative w-[280px] h-[280px] flex items-center justify-center">
            <svg className="absolute inset-0" width="280" height="280" viewBox="0 0 280 280" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="140" cy="140" r="130" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none" />
              <circle cx="140" cy="140" r="130" stroke={mode.color} strokeWidth="4" fill="none" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="text-center">
              <div className="text-5xl font-semibold text-text-primary tracking-wider font-mono">
                {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
              </div>
              <p className="text-xs text-text-muted mt-2">{mode.label} · {mode.duration} min</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-8">
            <button onClick={() => { setRunning(false); setTimeLeft(mode.duration * 60); }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted bg-surface-200 border border-border hover:border-border-hover transition-colors">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => setRunning(!running)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-colors" style={{ background: mode.color }}>
              {running ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
            </button>
            <button onClick={() => setSound(sound === 'none' ? 'rain' : 'none')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted bg-surface-200 border border-border hover:border-border-hover transition-colors">
              {sound !== 'none' ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full max-w-xs space-y-4">
          {/* Focus Task */}
          <div className="card p-4">
            <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2.5">Focus Task</h3>
            {focusTask ? (
              <div className="p-2.5 rounded-lg bg-surface-200 border border-border">
                <p className="text-sm text-text-primary">{focusTask.title}</p>
                <button onClick={() => setFocusTask(null)} className="text-[11px] text-accent-blue mt-1.5">Change</button>
              </div>
            ) : (
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {active.slice(0, 5).map(t => (
                  <button key={t.id} onClick={() => setFocusTask(t)} className="w-full text-left p-2 rounded-md hover:bg-surface-200/60 transition-colors">
                    <p className="text-xs text-text-secondary truncate">{t.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ambient */}
          <div className="card p-4">
            <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2.5">Ambient</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {sounds.map(s => (
                <button key={s.id} onClick={() => setSound(s.id)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${sound === s.id ? 'bg-surface-300 border border-border' : 'hover:bg-surface-200/50 border border-transparent'}`}>
                  <span className="text-base">{s.emoji}</span>
                  <span className="text-[9px] text-text-muted">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card p-4">
            <h3 className="text-xs text-text-muted uppercase tracking-wider mb-2.5">Progress</h3>
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i < sessions ? 'bg-accent-green' : 'bg-surface-400'}`} />
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2">{sessions}/8 sessions</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowSettings(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
              <div className="card p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-text-muted" />
                    <h2 className="text-sm font-semibold text-text-primary">Timer Settings</h2>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-text-muted hover:text-text-secondary transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {/* Presets */}
                <div className="mb-5">
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Presets</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESETS.map(preset => {
                      const isActive = editDurations.focus === preset.focus && editDurations.short === preset.short && editDurations.long === preset.long;
                      return (
                        <button key={preset.label} onClick={() => applyPreset(preset)}
                          className={`p-2.5 rounded-lg text-left transition-colors ${isActive ? 'bg-accent-blue/8 border border-accent-blue/20' : 'bg-surface-200 border border-border hover:border-border-hover'}`}>
                          <p className={`text-xs font-medium ${isActive ? 'text-accent-blue' : 'text-text-primary'}`}>{preset.label}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{preset.focus} / {preset.short} / {preset.long} min</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Durations */}
                <div className="mb-5">
                  <p className="text-[11px] text-text-muted uppercase tracking-wider mb-3">Custom Duration</p>
                  <div className="space-y-3">
                    <DurationPicker
                      label="Focus" value={editDurations.focus}
                      onChange={(v) => setEditDurations(p => ({ ...p, focus: v }))}
                    />
                    <DurationPicker
                      label="Short Break" value={editDurations.short}
                      onChange={(v) => setEditDurations(p => ({ ...p, short: v }))}
                    />
                    <DurationPicker
                      label="Long Break" value={editDurations.long}
                      onChange={(v) => setEditDurations(p => ({ ...p, long: v }))}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowSettings(false)} className="btn-secondary !py-1.5 !text-xs">Cancel</button>
                  <button onClick={applyDurations} className="btn-primary !py-1.5 !text-xs flex items-center gap-1.5">
                    <Check size={13} /> Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
