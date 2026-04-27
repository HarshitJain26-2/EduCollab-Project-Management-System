'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  assignedTo?: { id: string; name: string; avatar?: string };
  progress?: number;
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-blue-100 text-blue-600',
  low: 'bg-green-100 text-green-700',
};

const COLUMNS = [
  { key: 'not_started', label: 'Not Started', dotColor: 'bg-slate-300', textColor: 'text-slate-500', badgeCls: 'bg-slate-100 text-slate-600' },
  { key: 'in_progress', label: 'In Progress', dotColor: 'bg-[--primary-container]', textColor: 'text-[--primary]', badgeCls: 'bg-[--primary-fixed] text-[--primary]' },
  { key: 'done', label: 'Done', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600', badgeCls: 'bg-emerald-50 text-emerald-600' },
] as const;

export default function TasksPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data?.tasks || res.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchTasks(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/tasks`, form, { headers: { Authorization: `Bearer ${token}` } });
      setTasks((prev) => [res.data?.task || res.data, ...prev]);
      toast.success('Task created!');
      setCreateOpen(false);
      setForm({ title: '', description: '', priority: 'medium', deadline: '' });
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const moveTask = async (id: string, newStatus: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    try {
      await axios.patch(`${API}/tasks/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      toast.error('Failed to update status');
      fetchTasks();
    }
  };

  const getColumn = (status: string) => tasks.filter((t) => t.status === status);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[--primary] mb-1">Task Management</h1>
          <p className="text-[--on-surface-variant]">Streamline your academic collaboration and tracking.</p>
        </div>
        <div className="inline-flex p-1 bg-[--surface-container-high] rounded-xl self-start">
          <button
            onClick={() => setView('kanban')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-[--primary] font-bold' : 'text-[--on-surface-variant] hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">view_kanban</span>
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all ${view === 'list' ? 'bg-white shadow-sm text-[--primary] font-bold' : 'text-[--on-surface-variant] hover:bg-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-64" />)}
        </div>
      ) : view === 'kanban' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((col) => {
            const colTasks = getColumn(col.key);
            return (
              <div key={col.key} className="flex flex-col gap-4 min-w-[300px]">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${col.dotColor}`} />
                    <h3 className={`label-text text-[14px] uppercase tracking-wider font-bold ${col.textColor}`}>{col.label}</h3>
                    <span className={`${col.badgeCls} px-2 py-0.5 rounded-full text-xs font-bold`}>{colTasks.length}</span>
                  </div>
                </div>
                {/* Task Cards */}
                <div className="flex flex-col gap-4">
                  {colTasks.map((task) => (
                    <article key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-[--surface-container] hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium}`}>
                          {task.priority}
                        </span>
                        {col.key !== 'done' && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {col.key === 'not_started' && (
                              <button onClick={() => moveTask(task.id, 'in_progress')} title="Move to In Progress" className="text-[10px] label-text text-[--primary] hover:underline px-1">▶ Start</button>
                            )}
                            {col.key === 'in_progress' && (
                              <button onClick={() => moveTask(task.id, 'done')} title="Mark Done" className="text-[10px] label-text text-emerald-600 hover:underline px-1">✓ Done</button>
                            )}
                          </div>
                        )}
                        {col.key === 'done' && (
                          <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </div>
                      <h4 className={`font-semibold text-sm text-[--on-surface] mb-3 ${col.key === 'done' ? 'line-through opacity-60' : ''}`}>{task.title}</h4>
                      {task.status === 'in_progress' && task.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] font-bold text-[--outline] mb-1">
                            <span>Progress</span><span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-[--surface-container] rounded-full h-1.5">
                            <div className="bg-[--primary] h-1.5 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {task.deadline ? (
                          <div className="flex items-center gap-1 text-[--outline] text-xs">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        ) : <span />}
                        {task.assignedTo && (
                          <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700 ring-2 ring-white overflow-hidden">
                            {task.assignedTo.avatar ? (
                              <img src={task.assignedTo.avatar} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                            ) : (
                              task.assignedTo.name?.[0]?.toUpperCase()
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">task</span>
              <p className="text-[--on-surface-variant]">No tasks yet. Create your first one!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[--surface-container-low] border-b border-[--outline-variant]/20">
                <tr>
                  {['Title', 'Priority', 'Status', 'Deadline'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left label-text text-xs uppercase tracking-widest text-[--on-surface-variant] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[--outline-variant]/10">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-[--surface-container-low] transition-colors">
                    <td className="px-4 py-4 font-medium">{t.title}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${PRIORITY_BADGE[t.priority] ?? PRIORITY_BADGE.medium}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[--on-surface-variant]">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* FAB */}
      {(user?.role === 'leader' || user?.role === 'guide') && (
        <button
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[--primary] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 group"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
          <span className="absolute right-full mr-4 bg-[--primary] px-3 py-1.5 rounded-lg text-white label-text text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Create Task</span>
        </button>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Task Title *</label>
            <input
              className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
              placeholder="Research Methodology Framework"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm"
              rows={3}
              placeholder="Describe the task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Priority</label>
              <select
                className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm bg-white"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Deadline</label>
              <input
                type="date"
                className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[--primary] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </AppLayout>
  );
}
