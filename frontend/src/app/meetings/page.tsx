'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  agenda: string;
  meetingLink: string;
  participants?: { id: string; name: string; avatar?: string }[];
  createdBy?: { name: string };
}

export default function MeetingsPage() {
  const { token, user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', agenda: '', meetingLink: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(`${API}/meetings`, { headers: { Authorization: `Bearer ${token}` } });
      setMeetings(res.data?.meetings || res.data || []);
    } catch { setMeetings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchMeetings(); }, [token]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time) return toast.error('Title, date, and time are required');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/meetings`, form, { headers: { Authorization: `Bearer ${token}` } });
      setMeetings((prev) => [res.data?.meeting || res.data, ...prev]);
      toast.success('Meeting scheduled!');
      setScheduleOpen(false);
      setForm({ title: '', date: '', time: '', agenda: '', meetingLink: '' });
    } catch { toast.error('Failed to schedule meeting'); }
    finally { setSubmitting(false); }
  };

  const upcoming = meetings.filter((m) => new Date(`${m.date} ${m.time}`) >= new Date());
  const past = meetings.filter((m) => new Date(`${m.date} ${m.time}`) < new Date());

  return (
    <AppLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[--on-background] mb-1">Meetings</h1>
          <p className="text-[--on-surface-variant]">Schedule and join team meetings.</p>
        </div>
        {(user?.role === 'leader' || user?.role === 'guide') && (
          <button
            onClick={() => setScheduleOpen(true)}
            className="bg-[--primary] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">add</span>
            Schedule Meeting
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-28" />)}</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[--primary]">event</span>
                Upcoming
              </h2>
              <div className="space-y-4">
                {upcoming.map((m) => (
                  <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm border border-[--primary]/10 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[--primary-fixed] flex flex-col items-center justify-center text-[--primary] flex-shrink-0">
                      <span className="text-xl font-bold">{new Date(m.date).getDate()}</span>
                      <span className="label-text text-[10px] uppercase font-bold">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold mb-1">{m.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-[--on-surface-variant]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {m.time}
                        </span>
                        {m.createdBy && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {m.createdBy.name}
                          </span>
                        )}
                      </div>
                      {m.agenda && <p className="text-sm text-[--on-surface-variant] mt-2 line-clamp-2">{m.agenda}</p>}
                    </div>
                    {m.meetingLink ? (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[--primary] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                        Join Meeting
                      </a>
                    ) : (
                      <span className="label-text text-xs text-[--on-surface-variant] px-4 py-3 rounded-xl bg-[--surface-container]">No link yet</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[--on-surface-variant]">
                <span className="material-symbols-outlined">history</span>
                Past Meetings
              </h2>
              <div className="space-y-3">
                {past.slice(0, 5).map((m) => (
                  <div key={m.id} className="bg-[--surface-container-low] rounded-xl p-4 flex items-center gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-lg bg-[--surface-container] flex flex-col items-center justify-center text-[--on-surface-variant] flex-shrink-0">
                      <span className="text-sm font-bold">{new Date(m.date).getDate()}</span>
                      <span className="label-text text-[8px] uppercase">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{m.title}</p>
                      <p className="text-xs text-[--on-surface-variant]">{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {meetings.length === 0 && (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">event</span>
              <h3 className="text-xl font-bold mb-2">No meetings scheduled</h3>
              <p className="text-[--on-surface-variant]">Schedule your first team meeting to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Meeting">
        <form onSubmit={handleSchedule} className="space-y-5">
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Meeting Title *</label>
            <input className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm" placeholder="Weekly Team Standup" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Date *</label>
              <input type="date" className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Time *</label>
              <input type="time" className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Agenda</label>
            <textarea className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none resize-none text-sm" rows={3} placeholder="Topics to discuss..." value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
          </div>
          <div>
            <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block mb-2">Meeting Link (Google Meet / Zoom)</label>
            <input className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-4 bg-[--primary] text-white rounded-xl font-semibold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
            {submitting ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </Modal>
    </AppLayout>
  );
}
