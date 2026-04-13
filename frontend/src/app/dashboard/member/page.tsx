'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { CheckSquare, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MemberDashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/tasks'), api.get('/meetings'), api.get('/updates')])
            .then(([tRes, mRes, uRes]) => {
                setTasks(tRes.data.tasks || []);
                setMeetings((mRes.data.meetings || []).filter((m: any) => new Date(m.date) >= new Date()));
                setUpdates(uRes.data.updates || []);
            })
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed').length;
    const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                        My Workspace
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Track your tasks and stay on top of deadlines.</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'My Tasks', value: tasks.length, icon: CheckSquare, color: '#6c63ff' },
                        { label: 'Pending', value: pendingTasks, icon: Clock, color: '#fbbf24' },
                        { label: 'Completed', value: completedTasks, icon: CheckSquare, color: '#34d399' },
                        { label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: '#f87171' },
                    ].map(stat => (
                        <div key={stat.label} className="card stat-card" style={{ padding: '20px 18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                </div>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={18} color={stat.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Overall Progress */}
                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Overall Task Completion</h3>
                        <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-secondary)' }}>{progressPct}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 12 }}>
                        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{completedTasks} of {tasks.length} tasks completed</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    {/* Assigned Tasks */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Tasks</h3>
                            <Link href="/tasks" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>View all →</Link>
                        </div>
                        {tasks.length === 0 ? <div className="empty-state"><CheckSquare size={40} /><p>No tasks assigned</p></div> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tasks.slice(0, 5).map((t: any) => (
                                    <div key={t.id} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{t.title}</span>
                                            <span className={`badge status-${t.status}`} style={{ marginLeft: 8 }}>{t.status.replace('_', ' ')}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                            <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                                            {t.deadline && <span style={{ fontSize: 11, color: new Date(t.deadline) < new Date() && t.status !== 'completed' ? 'var(--accent-red)' : 'var(--text-muted)' }}>Due {format(new Date(t.deadline), 'MMM d')}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>

                    {/* Upcoming Meetings */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Upcoming Meetings</h3>
                            <Link href="/meetings" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>View all →</Link>
                        </div>
                        {meetings.length === 0 ? <div className="empty-state"><Calendar size={40} /><p>No upcoming meetings</p></div> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {meetings.slice(0, 4).map((m: any) => (
                                    <div key={m.id} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-primary)' }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{m.title}</div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span>📅 {format(new Date(m.date), 'MMM d, yyyy')}</span>
                                            <span>🕐 {m.time}</span>
                                        </div>
                                        {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>Join Meeting</a>}
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>

                {/* Recent Updates */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Recent Updates</h3>
                        <Link href="/updates" className="btn btn-primary btn-sm"><FileText size={14} /> Submit Update</Link>
                    </div>
                    {updates.length === 0 ? <div className="empty-state"><FileText size={40} /><p>No updates submitted yet</p></div> :
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {updates.slice(0, 3).map((u: any) => (
                                <div key={u.id} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📅 {format(new Date(u.date), 'MMM d, yyyy')}</span>
                                        <span className={`badge ${u.status === 'approved' ? 'badge-green' : u.status === 'revision_requested' ? 'badge-red' : 'badge-yellow'}`}>{u.status.replace('_', ' ')}</span>
                                    </div>
                                    <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{u.workCompleted}</p>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </DashboardLayout>
    );
}
