'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, X, MessageSquare, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { useSocket } from '@/context/SocketContext';

export default function UpdatesPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [updates, setUpdates] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ project: '', date: format(new Date(), 'yyyy-MM-dd'), workCompleted: '', issuesFaced: '', nextSteps: '' });
    const [saving, setSaving] = useState(false);
    const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
    const [selectedProject, setSelectedProject] = useState('');

    const fetchAll = () => {
        setLoading(true);
        Promise.all([api.get('/updates'), api.get('/projects')])
            .then(([uRes, pRes]) => {
                const fetchedUpdates = uRes.data.updates || [];
                const fetchedProjects = pRes.data.projects || [];
                setUpdates(fetchedUpdates);
                setProjects(fetchedProjects);

                // Auto-select if only one project
                if (fetchedProjects.length === 1) {
                    setSelectedProject(fetchedProjects[0].id);
                    setForm(prev => ({ ...prev, project: fetchedProjects[0].id }));
                }
            })
            .catch(() => toast.error('Failed to load updates'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleUpdateSync = () => fetchAll();
        
        socket.on('update_added', handleUpdateSync);
        socket.on('update_status_changed', handleUpdateSync);
        socket.on('comment_added', handleUpdateSync);

        return () => {
            socket.off('update_added', handleUpdateSync);
            socket.off('update_status_changed', handleUpdateSync);
            socket.off('comment_added', handleUpdateSync);
        };
    }, [socket]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            await api.post('/updates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Daily update submitted!');
            setShowModal(false);
            setForm({ project: '', date: format(new Date(), 'yyyy-MM-dd'), workCompleted: '', issuesFaced: '', nextSteps: '' });
            fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit update');
        } finally {
            setSaving(false);
        }
    };

    const handleComment = async (updateId: string) => {
        const text = commentText[updateId];
        if (!text?.trim()) return;
        try {
            await api.post(`/updates/${updateId}/comment`, { text });
            toast.success('Comment added!');
            setCommentText(prev => ({ ...prev, [updateId]: '' }));
            fetchAll();
        } catch { toast.error('Failed to add comment'); }
    };

    const handleStatusChange = async (updateId: string, status: string) => {
        try {
            await api.patch(`/updates/${updateId}/status`, { status });
            toast.success(status === 'approved' ? 'Update approved!' : 'Revision requested');
            fetchAll();
        } catch { toast.error('Failed to update status'); }
    };

    const filteredUpdates = selectedProject ? updates.filter(u => u.project === selectedProject || u.project?.id === selectedProject) : updates;

    const getInitials = (name: string) => name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Daily Updates</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Progress logs from the team</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select className="input" style={{ width: 180 }} value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {user?.role === 'member' && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Submit Update</button>}
                    </div>
                </div>

                {filteredUpdates.length === 0 ? (
                    <div className="empty-state card" style={{ padding: 60 }}>
                        <FileText size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>No updates yet</p>
                        {user?.role === 'member' && <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}><Plus size={16} /> Submit First Update</button>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {filteredUpdates.map((update: any) => (
                            <div key={update.id} className="card" style={{ padding: 24 }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className="avatar">{getInitials(update.member?.name || '')}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{update.member?.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {format(new Date(update.date), 'EEEE, MMMM d, yyyy')}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span className={`badge ${update.status === 'approved' ? 'badge-green' : update.status === 'revision_requested' ? 'badge-red' : 'badge-yellow'}`}>
                                            {update.status === 'approved' ? <CheckCircle size={12} style={{ marginRight: 4 }} /> : update.status === 'revision_requested' ? <AlertCircle size={12} style={{ marginRight: 4 }} /> : <Clock size={12} style={{ marginRight: 4 }} />}
                                            {update.status.replace('_', ' ')}
                                        </span>
                                        {(user?.role === 'guide' || user?.role === 'leader') && update.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-sm" onClick={() => handleStatusChange(update.id, 'approved')} style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', gap: 4 }}>
                                                    <CheckCircle size={12} /> Approve
                                                </button>
                                                <button className="btn btn-sm" onClick={() => handleStatusChange(update.id, 'revision_requested')} style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', gap: 4 }}>
                                                    <AlertCircle size={12} /> Revision
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                                    {[
                                        { label: '✅ Work Completed', text: update.workCompleted, color: '#34d399' },
                                        { label: '⚠️ Issues Faced', text: update.issuesFaced, color: '#fbbf24' },
                                        { label: '🎯 Next Steps', text: update.nextSteps, color: '#22d3ee' },
                                    ].map(section => section.text ? (
                                        <div key={section.label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14, borderLeft: `3px solid ${section.color}` }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: section.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{section.label}</div>
                                            <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{section.text}</p>
                                        </div>
                                    ) : null)}
                                </div>

                                {/* Comments */}
                                {update.comments?.length > 0 && (
                                    <div style={{ marginBottom: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Comments ({update.comments.length})</div>
                                        {update.comments.map((c: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                                <div className="avatar avatar-sm" style={{ background: c.author?.role === 'guide' ? '#f472b6' : 'var(--accent-primary)' }}>{getInitials(c.author?.name || '')}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.author?.name}</span>
                                                        <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 8 }}>{c.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment */}
                                {(user?.role === 'guide' || user?.role === 'leader') && (
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input
                                            className="input" placeholder="Add a comment..." style={{ flex: 1 }}
                                            value={commentText[update.id] || ''} onChange={e => setCommentText(prev => ({ ...prev, [update.id]: e.target.value }))}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment(update.id)}
                                        />
                                        <button className="btn btn-primary btn-sm" onClick={() => handleComment(update.id)}><MessageSquare size={14} /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Update Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e: any) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Submit Daily Update</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Project *</label>
                                    <select className="input" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required>
                                        <option value="">Select project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Date</label>
                                    <input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Work Completed *</label>
                                <textarea className="input" rows={3} placeholder="Describe what you accomplished today..." value={form.workCompleted} onChange={e => setForm({ ...form, workCompleted: e.target.value })} required style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="label">Issues Faced</label>
                                <textarea className="input" rows={2} placeholder="Any blockers or challenges?" value={form.issuesFaced} onChange={e => setForm({ ...form, issuesFaced: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label className="label">Next Steps</label>
                                <textarea className="input" rows={2} placeholder="What will you work on tomorrow?" value={form.nextSteps} onChange={e => setForm({ ...form, nextSteps: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? <div className="spinner" /> : 'Submit Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
