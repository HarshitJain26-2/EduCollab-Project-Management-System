'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline?: string;
  project?: { name: string };
}

export default function MemberDashboard() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [form, setForm] = useState({ workCompleted: '', issuesFaced: '', nextSteps: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
        const all = res.data?.tasks || res.data || [];
        setTasks(all.filter((t: Task) => t.status !== 'done'));
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTasks();
  }, [token]);

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workCompleted.trim()) return toast.error('Please fill in what you completed today.');
    setSubmitting(true);
    try {
      await axios.post(`${API}/updates`, { ...form, date: new Date().toISOString() }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Daily update submitted! 🎉');
      setSubmitOpen(false);
      setForm({ workCompleted: '', issuesFaced: '', nextSteps: '' });
    } catch {
      toast.error('Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityConfig = {
    high: { color: 'border-[--error]', iconColor: 'text-[--error]', bg: 'bg-red-50', icon: 'priority_high', label: 'Due Today', labelColor: 'text-[--error]' },
    medium: { color: 'border-[--tertiary]', iconColor: 'text-[--tertiary]', bg: 'bg-yellow-50', icon: 'hourglass_top', label: 'In Progress', labelColor: 'text-[--tertiary]' },
    low: { color: 'border-[--outline]', iconColor: 'text-slate-500', bg: 'bg-slate-50', icon: 'playlist_add_check', label: 'Upcoming', labelColor: 'text-slate-500' },
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Student';
  const highTasks = tasks.filter((t) => t.priority === 'high');
  const medTasks = tasks.filter((t) => t.priority === 'medium');
  const lowTasks = tasks.filter((t) => t.priority === 'low');
  const sortedTasks = [...highTasks, ...medTasks, ...lowTasks].slice(0, 5);

  return (
    <div>
      {/* Hero: Submit Update Banner */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-xl p-8 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #094cb2, #3366cc)' }}>
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Good morning, {firstName}.
              </h1>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed max-w-md">
                Stay consistent — log your progress to keep your team informed and your streak alive.
              </p>
              <button
                onClick={() => setSubmitOpen(true)}
                className="bg-white text-[--primary] px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined">history_edu</span>
                Submit Daily Update
              </button>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                <div className="text-center">
                  <span className="block text-5xl font-bold">{tasks.length}</span>
                  <span className="label-text text-[10px] uppercase tracking-widest font-medium opacity-80">Pending Tasks</span>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract blur orb */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-yellow-300 opacity-10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tasks Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-end justify-between px-2">
            <h2 className="text-2xl font-bold">My Pending Tasks</h2>
            <Link href="/tasks" className="label-text text-[--primary] text-xs font-semibold uppercase tracking-wider hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-20" />)}</div>
          ) : sortedTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">task_alt</span>
              <p className="text-slate-500">No pending tasks. Great job! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((t) => {
                const cfg = priorityConfig[t.priority as keyof typeof priorityConfig] ?? priorityConfig.low;
                return (
                  <div key={t.id} className={`bg-white rounded-xl p-6 shadow-sm flex items-center gap-6 border-l-4 ${cfg.color}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.iconColor}`}>
                      <span className="material-symbols-outlined">{cfg.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold mb-1">{t.title}</h3>
                      <p className="text-sm text-[--secondary]">{t.project?.name ?? 'Your Project'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`label-text text-[10px] uppercase font-bold ${cfg.labelColor} block mb-1`}>{cfg.label}</span>
                      {t.deadline && (
                        <span className="text-xs text-[--secondary]">{new Date(t.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contribution heatmap */}
          <div className="bg-[--surface-container-highest] rounded-xl p-8 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8">My Contribution Activity</h2>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = Math.random();
                const cls = intensity > 0.6 ? 'bg-[--primary]' : intensity > 0.3 ? 'bg-[--primary-fixed]' : 'bg-[--surface-dim]';
                return <div key={i} className={`h-4 w-4 ${cls} rounded-sm`} />;
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-12">
              <div>
                <span className="block text-3xl font-bold text-[--primary]">{tasks.length}</span>
                <span className="label-text text-[10px] uppercase font-bold text-[--secondary] tracking-widest">Active Tasks</span>
              </div>
              <div>
                <span className="block text-3xl font-bold text-[--tertiary]">{highTasks.length}</span>
                <span className="label-text text-[10px] uppercase font-bold text-[--secondary] tracking-widest">High Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quote */}
          <div className="bg-white rounded-xl p-8 border-l-4 border-[--tertiary] shadow-sm">
            <span className="material-symbols-outlined text-[--tertiary] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            <p className="serif-italic text-lg leading-relaxed text-[--on-surface] mb-4">
              &ldquo;The beautiful thing about learning is that no one can take it away from you.&rdquo;
            </p>
            <p className="label-text text-[10px] uppercase tracking-widest font-bold text-[--secondary]">B.B. King — Curated for you</p>
          </div>

          {/* Recent Feedback */}
          <div className="bg-[--secondary-container]/30 rounded-xl p-6 border border-white/50">
            <h3 className="font-bold text-sm label-text uppercase tracking-widest text-[--on-secondary-container] mb-4">Latest Updates</h3>
            <Link href="/updates" className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-[--on-surface] mb-2">View your team&apos;s latest daily updates and feedback from your guide.</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] label-text font-bold text-[--secondary] uppercase">Daily Updates</span>
                <span className="material-symbols-outlined text-[--primary] text-sm">arrow_forward</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Submit Update Modal */}
      <Modal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Daily Update">
        <form onSubmit={handleSubmitUpdate} className="space-y-5">
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">What did you complete today? *</label>
            <textarea
              className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm"
              rows={3}
              placeholder="Completed the data analysis module..."
              value={form.workCompleted}
              onChange={(e) => setForm({ ...form, workCompleted: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Issues / Blockers</label>
            <textarea
              className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm"
              rows={2}
              placeholder="Had trouble with API integration..."
              value={form.issuesFaced}
              onChange={(e) => setForm({ ...form, issuesFaced: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Next Steps</label>
            <textarea
              className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm"
              rows={2}
              placeholder="Will implement authentication tomorrow..."
              value={form.nextSteps}
              onChange={(e) => setForm({ ...form, nextSteps: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[--primary] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Update'}
          </button>
        </form>
      </Modal>

      {/* FAB */}
      <button
        onClick={() => setSubmitOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[--primary] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="absolute right-20 bg-[--primary] text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none label-text uppercase tracking-widest">
          Submit Update
        </span>
      </button>
    </div>
  );
}
