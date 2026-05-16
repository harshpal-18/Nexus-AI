import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const { calendarEvents, tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 13));
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState('2026-05-13');

  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = '2026-05-13';
  const ds = (day) => `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const evFor = (d) => calendarEvents.filter(e => e.date === d);
  const tkFor = (d) => tasks.filter(t => t.deadline === d);

  return (
    <div className="p-5 lg:p-8 h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Calendar</h1>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentDate(new Date(y, m - 1, 1))} className="p-1 rounded hover:bg-surface-200/50 text-text-muted"><ChevronLeft size={16} /></button>
            <span className="text-sm text-text-secondary min-w-[130px] text-center">{MONTHS[m]} {y}</span>
            <button onClick={() => setCurrentDate(new Date(y, m + 1, 1))} className="p-1 rounded hover:bg-surface-200/50 text-text-muted"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex gap-1">
          {['month', 'week', 'day'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1 rounded-md text-xs capitalize ${view === v ? 'bg-surface-300 text-text-primary' : 'text-text-muted'}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 card p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="grid grid-cols-7 gap-px mb-1">
            {DAYS.map(d => <div key={d} className="text-center text-[11px] text-text-muted py-1.5">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px flex-1 auto-rows-fr overflow-y-auto">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="p-1" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1, d = ds(day), ev = evFor(d), tk = tkFor(d), isToday = d === today, isSel = d === selectedDate;
              return (
                <button key={day} onClick={() => setSelectedDate(d)}
                  className={`p-1.5 rounded-md text-left transition-colors min-h-[56px] flex flex-col ${isSel ? 'bg-accent-blue-soft border border-accent-blue-border' : 'hover:bg-surface-200/40 border border-transparent'}`}>
                  <span className={`text-[11px] inline-flex items-center justify-center w-5 h-5 rounded-full ${isToday ? 'bg-accent-blue text-white' : 'text-text-secondary'}`}>{day}</span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {ev.slice(0, 2).map(e => <div key={e.id} className="text-[9px] px-1 py-px rounded truncate" style={{ background: `${e.color}18`, color: e.color }}>{e.title}</div>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-4 overflow-y-auto">
          <h2 className="text-sm font-medium text-text-primary mb-3">{selectedDate === today ? 'Today' : selectedDate}</h2>
          {evFor(selectedDate).length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Events</p>
              <div className="space-y-2">
                {evFor(selectedDate).map(e => (
                  <div key={e.id} className="p-2.5 rounded-lg bg-surface-200/50 border border-border">
                    <div className="w-full h-0.5 rounded-full mb-2" style={{ background: e.color }} />
                    <p className="text-sm text-text-primary">{e.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1"><Clock size={10} />{e.time} · {e.duration}min</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tkFor(selectedDate).length > 0 && (
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Tasks Due</p>
              {tkFor(selectedDate).map(t => (
                <div key={t.id} className="p-2.5 rounded-lg bg-surface-200/50 border border-border mb-2">
                  <p className="text-sm text-text-primary">{t.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t.category}</p>
                </div>
              ))}
            </div>
          )}
          {evFor(selectedDate).length === 0 && tkFor(selectedDate).length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">Nothing scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
}
