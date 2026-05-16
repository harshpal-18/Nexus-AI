import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Search, LayoutGrid, List, CheckCircle2, Calendar, Trash2, X, Archive, RotateCcw, Filter, SlidersHorizontal, Sparkles, Clock, Tag, ChevronDown } from 'lucide-react';

const statusCfg = {
  'todo': { label: 'To Do', dot: '#64748B' },
  'in-progress': { label: 'In Progress', dot: '#2563EB' },
  'done': { label: 'Done', dot: '#22C55E' },
};
const priorityCfg = {
  high: { label: 'High', cls: 'badge-red' },
  medium: { label: 'Medium', cls: 'badge-amber' },
  low: { label: 'Low', cls: 'badge-blue' },
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, archiveTask, searchTasks, filterPresets, taskTemplates, parseNaturalLanguageTask } = useApp();
  const [view, setView] = useState('kanban');
  const [showModal, setShowModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'Development', deadline: '', status: 'todo' });
  const [editing, setEditing] = useState(null);

  // Build filter object for the search engine
  const filtered = useMemo(() => {
    const filters = { search };
    if (filter !== 'all') filters.status = filter;
    if (priorityFilter !== 'all') filters.priority = priorityFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    if (sortBy !== 'default') filters.sort = sortBy;
    return searchTasks(filters);
  }, [tasks, filter, priorityFilter, categoryFilter, sortBy, search, searchTasks]);

  const categories = useMemo(() => [...new Set(tasks.map(t => t.category))], [tasks]);

  const save = () => {
    if (!form.title.trim()) return;
    if (editing) updateTask(editing.id, form);
    else addTask(form);
    setForm({ title: '', description: '', priority: 'medium', category: 'Development', deadline: '', status: 'todo' });
    setEditing(null);
    setShowModal(false);
  };

  const quickAdd = () => {
    if (!quickInput.trim()) return;
    addTask(quickInput);
    setQuickInput('');
  };

  const applyTemplate = (template) => {
    setForm({ title: '', description: '', ...template.fields, deadline: '', status: 'todo' });
    setShowTemplates(false);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', priority: task.priority, category: task.category, deadline: task.deadline || '', status: task.status });
    setEditing(task);
    setShowModal(true);
  };

  const cols = ['todo', 'in-progress', 'done'];

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Tasks</h1>
          <p className="text-sm text-text-muted">{tasks.length} total · {tasks.filter(t => t.status === 'done').length} completed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-8 !py-1.5 !text-xs w-44" />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border">
            <button onClick={() => setView('kanban')} className={`px-2.5 py-1.5 ${view === 'kanban' ? 'bg-surface-300 text-text-primary' : 'text-text-muted'}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setView('list')} className={`px-2.5 py-1.5 ${view === 'list' ? 'bg-surface-300 text-text-primary' : 'text-text-muted'}`}><List size={14} /></button>
          </div>
          <button onClick={() => { setEditing(null); setForm({ title: '', description: '', priority: 'medium', category: 'Development', deadline: '', status: 'todo' }); setShowModal(true); }}
            className="btn-primary !py-1.5 flex items-center gap-1.5 !text-xs"><Plus size={14} /> Add Task</button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue" />
          <input type="text" value={quickInput} onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && quickAdd()}
            placeholder='Quick add: "Fix login bug urgent by 2026-05-20 #backend"'
            className="input pl-8 !py-2 !text-xs" />
        </div>
        <button onClick={quickAdd} disabled={!quickInput.trim()} className="btn-primary !py-1.5 !text-xs">Add</button>
        <div className="relative">
          <button onClick={() => setShowTemplates(!showTemplates)} className="btn-secondary !py-1.5 !text-xs flex items-center gap-1">
            Templates <ChevronDown size={12} />
          </button>
          {showTemplates && (
            <div className="absolute right-0 top-full mt-1 card p-2 z-20 w-48 space-y-0.5">
              {taskTemplates.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t)}
                  className="w-full text-left px-2.5 py-2 rounded-md text-xs text-text-secondary hover:bg-surface-200/50 transition-colors flex items-center gap-2">
                  <span>{t.icon}</span> {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {['all', 'todo', 'in-progress', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${filter === f ? 'bg-surface-300 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {f === 'all' ? 'All' : statusCfg[f]?.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border hidden sm:block" />

        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="input !w-auto !py-1 !px-2 !text-[11px]">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="input !w-auto !py-1 !px-2 !text-[11px]">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="input !w-auto !py-1 !px-2 !text-[11px]">
          <option value="default">Sort: Default</option>
          <option value="deadline-asc">Deadline ↑</option>
          <option value="deadline-desc">Deadline ↓</option>
          <option value="priority-high">Priority: High first</option>
          <option value="created-newest">Newest first</option>
          <option value="title-az">A–Z</option>
        </select>
      </div>

      {/* Kanban View */}
      {view === 'kanban' ? (
        <div className="grid md:grid-cols-3 gap-4 flex-1 min-h-0">
          {cols.map(col => {
            const colTasks = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusCfg[col].dot }} />
                  <span className="text-xs font-medium text-text-secondary">{statusCfg[col].label}</span>
                  <span className="text-[10px] text-text-muted">{colTasks.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto pb-4">
                  {colTasks.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="card-hover p-4 cursor-pointer group" onClick={() => openEdit(task)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={priorityCfg[task.priority].cls}>{priorityCfg[task.priority].label}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {task.status !== 'done' && (
                            <button onClick={(e) => { e.stopPropagation(); completeTask(task.id); }} className="text-text-muted hover:text-accent-green" title="Complete">
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); archiveTask(task.id); }} className="text-text-muted hover:text-amber-400" title="Archive">
                            <Archive size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-text-muted hover:text-accent-red" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm text-text-primary mb-1">{task.title}</h3>
                      <p className="text-xs text-text-muted line-clamp-2 mb-2.5">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="tag">{task.category}</span>
                        <div className="flex items-center gap-2">
                          {task.estimatedMinutes && (
                            <span className="text-[10px] text-text-muted flex items-center gap-0.5" title="AI estimated duration">
                              <Clock size={9} /> {task.estimatedMinutes}m
                            </span>
                          )}
                          {task.deadline && <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar size={10} />{task.deadline.slice(5)}</span>}
                        </div>
                      </div>
                      {task.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-accent-blue/5 text-accent-blue border border-accent-blue/10">{tag}</span>
                          ))}
                        </div>
                      )}
                      {task.subtasks?.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between text-xs text-text-muted">
                          <span>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
                          <div className="w-12 h-1 rounded-full bg-surface-400 overflow-hidden">
                            <div className="h-full rounded-full bg-accent-green" style={{ width: `${(task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {colTasks.length === 0 && <div className="text-center py-8 text-text-muted text-xs">No tasks</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-1 flex-1 overflow-y-auto">
          {filtered.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200/40 transition-colors group cursor-pointer" onClick={() => openEdit(task)}>
              <button onClick={(e) => { e.stopPropagation(); task.status === 'done' ? updateTask(task.id, { status: 'todo' }) : completeTask(task.id); }}
                className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${task.status === 'done' ? 'bg-accent-green/20 border-accent-green' : 'border-text-muted hover:border-accent-green'}`}>
                {task.status === 'done' && <CheckCircle2 size={12} className="text-accent-green" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</p>
                {task.estimatedMinutes && <span className="text-[10px] text-text-muted">{task.estimatedMinutes}m est.</span>}
              </div>
              <span className="tag hidden sm:inline">{task.category}</span>
              <span className={`${priorityCfg[task.priority].cls} hidden sm:inline-flex`}>{task.priority}</span>
              {task.deadline && <span className="text-[10px] text-text-muted hidden md:inline">{task.deadline.slice(5)}</span>}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={(e) => { e.stopPropagation(); archiveTask(task.id); }} className="text-text-muted hover:text-amber-400"><Archive size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-text-muted hover:text-accent-red"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-text-muted text-sm">No tasks match your filters</div>}
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
              <div className="card p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-text-primary">{editing ? 'Edit Task' : 'New Task'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-secondary"><X size={16} /></button>
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" autoFocus />
                  <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input resize-none h-20" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input !py-2 text-xs">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input !py-2 text-xs">
                      {['Development', 'Design', 'Marketing', 'Content', 'Research', 'Management', 'General'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input !py-2 text-xs" />
                    {editing && (
                      <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input !py-2 text-xs">
                        <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button onClick={() => setShowModal(false)} className="btn-secondary !py-1.5 !text-xs">Cancel</button>
                  <button onClick={save} className="btn-primary !py-1.5 !text-xs">{editing ? 'Save' : 'Create'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
