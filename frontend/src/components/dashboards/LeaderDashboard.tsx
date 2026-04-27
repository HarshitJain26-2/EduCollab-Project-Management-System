'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Task { id: string; title: string; status: string; priority: string; deadline?: string; }
interface Update { id: string; workCompleted: string; status: string; member?: { name: string; avatar?: string }; date: string; }
interface Project { id: string; name: string; description: string; progress: number; members?: { id: string; name: string; avatar?: string; }[]; }

export default function LeaderDashboard() {
  const { token } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes, uRes] = await Promise.all([
          axios.get(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/updates`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const allProjects = pRes.data?.projects || pRes.data || [];
        setProject(allProjects[0] ?? null);
        setTasks(tRes.data?.tasks || tRes.data || []);
        const allUpdates = uRes.data?.updates || uRes.data || [];
        setPendingUpdates(allUpdates.filter((u: Update) => u.status === 'pending'));
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleApprove = async (updateId: string) => {
    try {
      await axios.patch(`${API}/updates/${updateId}`, { status: 'approved' }, { headers: { Authorization: `Bearer ${token}` } });
      setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
      toast.success('Update approved!');
    } catch {
      toast.error('Failed to approve update');
    }
  };

  const handleReject = async (updateId: string) => {
    try {
      await axios.patch(`${API}/updates/${updateId}`, { status: 'rejected' }, { headers: { Authorization: `Bearer ${token}` } });
      setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
      toast.success('Update rejected');
    } catch {
      toast.error('Failed to reject update');
    }
  };

  const myTasks = tasks.filter((t) => t.status !== 'done').slice(0, 3);

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2">
          {project ? `Project: ${project.name}` : 'Your Projects'}
        </h1>
        {project?.description && (
          <p className="text-[--on-surface-variant] max-w-2xl italic">&ldquo;{project.description}&rdquo;</p>
        )}
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="md:col-span-4 bg-[--surface-container-low] p-6 rounded-xl animate-pulse h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Active Project Progress */}
          <div className="md:col-span-8 bg-white rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">history_edu</span>
            </div>
            <div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="label-text text-xs uppercase tracking-widest text-[--tertiary] font-bold">Active Sprint</span>
                  <h2 className="text-3xl mt-1">{project?.name ?? 'No Project Yet'}</h2>
                </div>
                <div className="bg-yellow-100 px-3 py-1 rounded text-yellow-800 label-text text-xs font-bold">
                  {project?.progress ?? 0}% DONE
                </div>
              </div>
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm">Milestone Completion</span>
                  <span className="text-2xl font-bold">{project?.progress ?? 0}%</span>
                </div>
                <div className="w-full h-3 bg-[--surface-container] rounded-full overflow-hidden">
                  <div className="h-full bg-[--primary] rounded-full transition-all duration-1000" style={{ width: `${project?.progress ?? 0}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[--outline-variant]/15">
              <div>
                <p className="label-text text-xs text-[--on-surface-variant] uppercase mb-1">Total Tasks</p>
                <p className="text-xl font-bold">{tasks.length}</p>
              </div>
              <div>
                <p className="label-text text-xs text-[--on-surface-variant] uppercase mb-1">Pending Reviews</p>
                <p className="text-xl font-bold">{pendingUpdates.length}</p>
              </div>
              <div>
                <p className="label-text text-xs text-[--on-surface-variant] uppercase mb-1">Team Size</p>
                <p className="text-xl font-bold">{project?.members?.length ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="md:col-span-4 bg-[--surface-container-low] rounded-xl p-6 flex flex-col">
            <h3 className="text-xl mb-6">Team Overview</h3>
            <div className="space-y-5 flex-grow">
              {project?.members?.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-600">
                      {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : m.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-[10px] label-text uppercase text-[--on-surface-variant]">Team Member</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-1.5 w-16 bg-[--surface-container-highest] rounded-full overflow-hidden">
                      <div className="h-full bg-[--primary] rounded-full" style={{ width: '70%' }} />
                    </div>
                    <p className="text-[10px] label-text mt-1">Active</p>
                  </div>
                </div>
              ))}
              {(!project?.members || project.members.length === 0) && (
                <p className="text-sm text-[--on-surface-variant]">No team members yet.</p>
              )}
            </div>
            <Link href="/projects" className="w-full mt-8 py-3 text-xs label-text uppercase tracking-widest font-bold text-[--primary] hover:bg-[--primary-fixed] transition-colors rounded-lg text-center block">
              View Full Team Roster
            </Link>
          </div>

          {/* Pending Approvals */}
          <div className="md:col-span-6 bg-[--surface-container-high] rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl">Pending Approvals</h3>
              {pendingUpdates.length > 0 && (
                <span className="bg-[--error] text-white text-[10px] label-text px-2 py-0.5 rounded-full font-bold">
                  {pendingUpdates.length} NEW
                </span>
              )}
            </div>
            <div className="space-y-4">
              {pendingUpdates.slice(0, 3).map((u) => (
                <div key={u.id} className="bg-white p-4 rounded-lg flex items-center gap-4 hover:bg-slate-50 transition-all">
                  <div className="bg-[--primary]/10 text-[--primary] p-2 rounded">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold line-clamp-1">{u.workCompleted}</p>
                    <p className="text-[10px] label-text text-[--on-surface-variant]">
                      By {u.member?.name ?? 'Team Member'} • {new Date(u.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(u.id)} className="p-2 text-[--error] hover:bg-red-50 rounded-full transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <button onClick={() => handleApprove(u.id)} className="p-2 text-[--primary] hover:bg-blue-50 rounded-full transition-colors">
                      <span className="material-symbols-outlined">check</span>
                    </button>
                  </div>
                </div>
              ))}
              {pendingUpdates.length === 0 && (
                <p className="text-sm text-[--on-surface-variant]">No pending approvals. All caught up! ✓</p>
              )}
            </div>
          </div>

          {/* My Tasks */}
          <div className="md:col-span-6 bg-white rounded-xl p-8">
            <h3 className="text-xl mb-6">My Tasks</h3>
            <div className="space-y-4">
              {myTasks.map((t) => (
                <label key={t.id} className="flex items-center gap-4 p-4 border border-[--outline-variant]/20 rounded-lg hover:border-[--primary]/20 cursor-pointer transition-all">
                  <input type="checkbox" className="rounded text-[--primary] focus:ring-[--primary] h-5 w-5" defaultChecked={t.status === 'done'} readOnly />
                  <div className="flex-grow">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-[10px] label-text text-[--on-surface-variant] uppercase">
                      {t.priority} PRIORITY{t.deadline ? ` • DUE ${new Date(t.deadline).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[--on-surface-variant]/40">drag_indicator</span>
                </label>
              ))}
              {myTasks.length === 0 && (
                <p className="text-sm text-[--on-surface-variant]">No tasks assigned to you yet.</p>
              )}
              <Link href="/tasks" className="w-full py-3 border-2 border-dashed border-[--outline-variant]/30 rounded-lg flex items-center justify-center gap-2 text-[--primary] hover:border-[--primary]/50 transition-colors text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">add</span>
                View All Tasks
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <Link href="/updates">
        <button className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-[--primary] hover:bg-[--primary-container] text-white p-4 rounded-full shadow-lg transition-all active:scale-90 group z-50 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          <span className="hidden group-hover:inline-block label-text text-xs uppercase tracking-widest font-bold whitespace-nowrap">New Update</span>
        </button>
      </Link>
    </div>
  );
}
