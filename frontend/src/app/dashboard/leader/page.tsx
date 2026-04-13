'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { CheckSquare, Users, Clock, FolderOpen, Plus, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/projects'), api.get('/tasks')])
            .then(([pRes, tRes]) => { setProjects(pRes.data.projects || []); setTasks(tRes.data.tasks || []); })
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    const totalMembers = [...new Set(projects.flatMap((p: any) => p.members?.map((m: any) => m.id || m) || []))].length;

    const statusData = [
        { name: 'Not Started', value: tasks.filter(t => t.status === 'not_started').length, color: '#475569' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#22d3ee' },
        { name: 'Completed', value: completedTasks, color: '#34d399' },
    ];

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Leader Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Manage your team and track project progress.</p>
                    </div>
                    <Link href="/tasks" className="btn btn-primary"><Plus size={16} /> Assign Task</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'My Projects', value: projects.length, icon: FolderOpen, color: '#6c63ff' },
                        { label: 'Team Members', value: totalMembers, icon: Users, color: '#22d3ee' },
                        { label: 'Pending Tasks', value: pendingTasks, icon: Clock, color: '#fbbf24' },
                        { label: 'Completed Tasks', value: completedTasks, icon: CheckSquare, color: '#34d399' },
                    ].map(stat => (
                        <div key={stat.label} className="card stat-card" style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{stat.label}</div>
                                    <div style={{ fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={20} color={stat.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <TrendingUp size={20} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Task Status Overview</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={statusData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {statusData.map((d, i) => <Bar key={i} dataKey="value" fill={d.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Projects</h3>
                            <Link href="/projects" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>View all →</Link>
                        </div>
                        {projects.length === 0 ? <div className="empty-state"><FolderOpen size={40} /><p>No projects yet</p></div> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {projects.slice(0, 4).map((p: any) => (
                                    <Link key={p.id} href={`/projects/${p.id}`}>
                                        <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', cursor: 'pointer' }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</span>
                                                <span className={`badge status-${p.status}`}>{p.status}</span>
                                            </div>
                                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{p.progress}% complete · {p.members?.length || 0} members</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        }
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Tasks</h3>
                        <Link href="/tasks" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>View all →</Link>
                    </div>
                    {tasks.length === 0 ? <div className="empty-state"><CheckSquare size={40} /><p>No tasks yet</p></div> :
                        <table className="table">
                            <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Deadline</th></tr></thead>
                            <tbody>
                                {tasks.slice(0, 6).map((t: any) => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</td>
                                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="avatar avatar-sm">{t.assignedTo?.name?.[0] || '?'}</div>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.assignedTo?.name || 'Unassigned'}</span>
                                        </div></td>
                                        <td><span className={`badge priority-${t.priority}`}>{t.priority}</span></td>
                                        <td><span className={`badge status-${t.status}`}>{t.status.replace('_', ' ')}</span></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </DashboardLayout>
    );
}
