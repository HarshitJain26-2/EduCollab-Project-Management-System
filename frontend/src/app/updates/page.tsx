'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Update {
  id: string;
  workCompleted: string;
  issuesFaced: string;
  nextSteps: string;
  status: string;
  date: string;
  member?: { id: string; name: string; avatar?: string };
  comments?: { id: string; text: string; author?: { name: string }; createdAt: string }[];
}

export default function UpdatesPage() {
  const { token, user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ workCompleted: '', issuesFaced: '', nextSteps: '' });
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState<Record<string, string>>({});

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`${API}/updates`, { headers: { Authorization: `Bearer ${token}` } });
      setUpdates(res.data?.updates || res.data || []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchUpdates(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workCompleted.trim()) return toast.error('Work completed field is required');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/updates`, { ...form, date: new Date().toISOString() }, { headers: { Authorization: `Bearer ${token}` } });
      setUpdates((prev) => [res.data?.update || res.data, ...prev]);
      toast.success('Daily update submitted!');
      setSubmitOpen(false);
      setForm({ workCompleted: '', issuesFaced: '', nextSteps: '' });
    } catch {
      toast.error('Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComment = async (updateId: string) => {
    const text = comment[updateId]?.trim();
    if (!text) return;
    try {
      await axios.post(`${API}/updates/${updateId}/comments`, { text }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Comment posted');
      setComment((prev) => ({ ...prev, [updateId]: '' }));
      fetchUpdates();
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return map[s] ?? 'bg-slate-100 text-slate-600';
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[--on-background] mb-1">Daily Updates</h1>
          <p className="text-[--on-surface-variant]">Team standup feed — track progress, blockers, and next steps.</p>
        </div>
        {user?.role === 'member' && (
          <button
            onClick={() => setSubmitOpen(true)}
            className="bg-[--primary] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">add</span>
            Submit Update
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-32" />)}</div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">history_edu</span>
          <h3 className="text-xl font-bold mb-2">No updates yet</h3>
          <p className="text-[--on-surface-variant]">Be the first to submit a daily update for your team.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {updates.map((u) => {
            const isExpanded = expandedId === u.id;
            const initials = u.member?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';
            return (
              <div key={u.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-[--outline-variant]/10">
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 rounded-full bg-[--primary-fixed] flex items-center justify-center text-sm font-bold text-[--primary] overflow-hidden flex-shrink-0">
                      {u.member?.avatar ? <img src={u.member.avatar} alt={u.member.name} className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{u.member?.name ?? 'Team Member'}</p>
                      <p className="text-xs text-[--on-surface-variant]">{new Date(u.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <span className={`label-text text-[10px] uppercase font-bold px-3 py-1 rounded-full ${statusBadge(u.status)}`}>{u.status}</span>
                  </div>

                  {/* Work Completed */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                      <h4 className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] font-bold">Work Completed</h4>
                    </div>
                    <p className="text-sm leading-relaxed">{u.workCompleted}</p>
                  </div>

                  {isExpanded && (
                    <>
                      {u.issuesFaced && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[16px] text-[--error]">report_problem</span>
                            <h4 className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] font-bold">Issues / Blockers</h4>
                          </div>
                          <p className="text-sm leading-relaxed">{u.issuesFaced}</p>
                        </div>
                      )}
                      {u.nextSteps && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[16px] text-[--primary]">arrow_forward</span>
                            <h4 className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] font-bold">Next Steps</h4>
                          </div>
                          <p className="text-sm leading-relaxed">{u.nextSteps}</p>
                        </div>
                      )}

                      {/* Comments */}
                      {(u.comments?.length ?? 0) > 0 && (
                        <div className="mt-5 pt-5 border-t border-[--outline-variant]/20 space-y-3">
                          <h4 className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] font-bold">Comments</h4>
                          {u.comments?.map((c) => (
                            <div key={c.id} className="bg-[--surface-container-low] rounded-lg p-3">
                              <p className="text-xs font-semibold text-[--on-surface] mb-1">{c.author?.name ?? 'Guide'}</p>
                              <p className="text-sm">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="mt-4 flex gap-2">
                        <input
                          className="flex-grow p-3 border border-[--outline-variant] rounded-xl text-sm focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none"
                          placeholder="Add a comment..."
                          value={comment[u.id] ?? ''}
                          onChange={(e) => setComment((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(u.id)}
                        />
                        <button
                          onClick={() => handleComment(u.id)}
                          className="px-4 py-3 bg-[--primary] text-white rounded-xl hover:opacity-90 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : u.id)}
                    className="mt-4 text-[--primary] label-text text-xs font-semibold uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    {isExpanded ? 'Show Less' : 'Show Details & Comments'}
                    <span className="material-symbols-outlined text-[14px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      {user?.role === 'member' && (
        <button
          onClick={() => setSubmitOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-[--primary] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 group"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
          <span className="absolute right-full mr-4 bg-[--primary] px-3 py-1.5 rounded-lg text-white label-text text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Submit Update</span>
        </button>
      )}

      {/* Submit Modal */}
      <Modal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Daily Update">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">What did you complete today? *</label>
            <textarea className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm" rows={3} placeholder="Completed the data analysis module..." value={form.workCompleted} onChange={(e) => setForm({ ...form, workCompleted: e.target.value })} />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Issues / Blockers</label>
            <textarea className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm" rows={2} placeholder="Had trouble with API integration..." value={form.issuesFaced} onChange={(e) => setForm({ ...form, issuesFaced: e.target.value })} />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Next Steps</label>
            <textarea className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm" rows={2} placeholder="Will implement authentication tomorrow..." value={form.nextSteps} onChange={(e) => setForm({ ...form, nextSteps: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-4 bg-[--primary] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Update'}
          </button>
        </form>
      </Modal>
    </AppLayout>
  );
}
