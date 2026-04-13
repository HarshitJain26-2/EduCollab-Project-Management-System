'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, X, Calendar, Clock, Video, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { useSocket } from '@/context/SocketContext';

export default function MeetingsPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ project: '', title: '', date: '', time: '', agenda: '', meetingLink: '' });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const fetchAll = () => {
        setLoading(true);
        Promise.all([api.get('/meetings'), api.get('/projects')])
            .then(([mRes, pRes]) => { 
                const fetchedMeetings = mRes.data.meetings || [];
                const fetchedProjects = pRes.data.projects || [];
                setMeetings(fetchedMeetings); 
                setProjects(fetchedProjects); 

                // Auto-select in form if only one project
                if (fetchedProjects.length === 1) {
                    setForm(prev => ({ ...prev, project: fetchedProjects[0].id }));
                }
            })
            .catch(() => toast.error('Failed to load meetings'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (!socket) return;
        const handleMeetingAdded = () => fetchAll();
        socket.on('meeting_added', handleMeetingAdded);
        return () => { socket.off('meeting_added', handleMeetingAdded); };
    }, [socket]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/meetings', form);
            toast.success('Meeting scheduled!');
            setShowModal(false);
            setForm({ project: '', title: '', date: '', time: '', agenda: '', meetingLink: '' });
            fetchAll();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to schedule meeting'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this meeting?')) return;
        try { await api.delete(`/meetings/${id}`); toast.success('Meeting deleted'); fetchAll(); }
        catch { toast.error('Failed to delete meeting'); }
    };

    const now = new Date();
    const upcoming = meetings.filter(m => new Date(m.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = meetings.filter(m => new Date(m.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const displayed = activeTab === 'upcoming' ? upcoming : past;

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Meetings</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{upcoming.length} upcoming, {past.length} past</p>
                    </div>
                    {(user?.role === 'guide' || user?.role === 'leader') && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Schedule Meeting</button>
                    )}
                </div>

                <div className="tabs">
                    <div className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming ({upcoming.length})</div>
                    <div className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past ({past.length})</div>
                </div>

                {displayed.length === 0 ? (
                    <div className="empty-state card" style={{ padding: 60 }}>
                        <Calendar size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>No {activeTab} meetings</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {displayed.map((m: any) => {
                            const isPast = new Date(m.date) < now;
                            return (
                                <div key={m.id} className="card" style={{ padding: 24, opacity: isPast ? 0.75 : 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                            <div style={{ width: 52, height: 52, borderRadius: 12, background: isPast ? 'var(--bg-secondary)' : 'rgba(108,99,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: isPast ? 'var(--text-muted)' : 'var(--accent-secondary)', lineHeight: 1 }}>{format(new Date(m.date), 'd')}</div>
                                                <div style={{ fontSize: 10, color: isPast ? 'var(--text-muted)' : 'var(--accent-secondary)', textTransform: 'uppercase' }}>{format(new Date(m.date), 'MMM')}</div>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{m.title}</h3>
                                                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {m.time}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {format(new Date(m.date), 'EEE, MMM d')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {(user?.role === 'guide' || user?.role === 'leader') && (
                                            <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Trash2 size={14} /></button>
                                        )}
                                    </div>

                                    {m.agenda && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6, background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>{m.agenda}</p>}

                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                        {m.meetingLink && !isPast && (
                                            <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                <Video size={14} /> Join Meeting
                                            </a>
                                        )}
                                        {m.createdBy && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {m.createdBy.name}</span>}
                                        {m.participants?.length > 0 && (
                                            <div style={{ display: 'flex', gap: -4, marginLeft: 'auto' }}>
                                                {m.participants.slice(0, 4).map((p: any, i: number) => (
                                                    <div key={i} className="avatar avatar-sm" style={{ border: '2px solid var(--bg-card)', marginLeft: i > 0 ? -8 : 0, zIndex: i, background: 'var(--accent-primary)' }}>
                                                        {p.name?.[0] || '?'}
                                                    </div>
                                                ))}
                                                {m.participants.length > 4 && <div className="avatar avatar-sm" style={{ border: '2px solid var(--bg-card)', marginLeft: -8, background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 9 }}>+{m.participants.length - 4}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Schedule Meeting Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e: any) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Schedule Meeting</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="label">Project *</label>
                                <select className="input" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required>
                                    <option value="">Select project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Meeting Title *</label>
                                <input className="input" type="text" placeholder="e.g. Weekly Standup" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Date *</label>
                                    <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required min={format(new Date(), 'yyyy-MM-dd')} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Time *</label>
                                    <input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Agenda</label>
                                <textarea className="input" rows={3} placeholder="Meeting agenda and topics to discuss..." value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="label">Meeting Link (Google Meet / Zoom)</label>
                                <input className="input" type="url" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? <div className="spinner" /> : 'Schedule'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
