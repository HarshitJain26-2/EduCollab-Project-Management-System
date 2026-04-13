'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FolderOpen, CheckSquare, Users, Clock, Plus, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuideDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/projects'), api.get('/tasks')])
            .then(([pRes, tRes]) => {
                setProjects(pRes.data.projects || []);
                setTasks(tRes.data.tasks || []);
            })
            .catch(() => toast.error('Failed to load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const members = [...new Set(projects.flatMap((p: any) => p.members?.map((m: any) => m.id || m.id) || []))].length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

    const taskPieData = [
        { name: 'Completed', value: completedTasks, color: '#34d399' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#22d3ee' },
        { name: 'Not Started', value: tasks.filter(t => t.status === 'not_started').length, color: '#475569' },
    ].filter(d => d.value > 0);

    const projectBarData = projects.slice(0, 6).map((p: any) => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
        progress: p.progress || 0,
    }));

    if (loading) return (
        <DashboardLayout>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Here&apos;s what&apos;s happening across your projects today.</p>
                    </div>
                    <Link href="/projects" className="btn btn-primary">
                        <Plus size={16} /> New Project
                    </Link>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'Total Projects', value: totalProjects, icon: FolderOpen, color: '#6c63ff', sub: `${activeProjects} active` },
                        { label: 'Members Supervised', value: members, icon: Users, color: '#22d3ee', sub: 'across all projects' },
                        { label: 'Pending Tasks', value: pendingTasks, icon: Clock, color: '#fbbf24', sub: `of ${totalTasks} total` },
                        { label: 'Completed Tasks', value: completedTasks, icon: CheckSquare, color: '#34d399', sub: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate` },
                    ].map(stat => (
                        <div key={stat.label} className="card stat-card" style={{ padding: '24px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>{stat.label}</div>
                                    <div style={{ fontSize: 36, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                </div>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 32 }}>
                    {/* Task Distribution Pie */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <TrendingUp size={20} color="var(--accent-primary)" />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Task Distribution</h3>
                        </div>
                        {taskPieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {taskPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                                    {taskPieData.map(d => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                                            {d.name} ({d.value})
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state"><Activity size={40} /><p>No tasks yet</p></div>
                        )}
                    </div>

                    {/* Project Progress Bar Chart */}
                    <div className="card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <Activity size={20} color="var(--accent-cyan)" />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Project Progress</h3>
                        </div>
                        {projectBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={projectBarData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} formatter={(v: any) => [`${v}%`, 'Progress']} />
                                    <Bar dataKey="progress" fill="#6c63ff" radius={[4, 4, 0, 0]}>
                                        {projectBarData.map((_, i) => <Cell key={i} fill={`hsl(${250 + i * 20}, 70%, 65%)`} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state"><FolderOpen size={40} /><p>No projects yet. <Link href="/projects" style={{ color: 'var(--accent-secondary)' }}>Create one</Link></p></div>
                        )}
                    </div>
                </div>

                {/* Projects List */}
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>All Projects</h3>
                        <Link href="/projects" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>View all →</Link>
                    </div>
                    {projects.length === 0 ? (
                        <div className="empty-state">
                            <FolderOpen size={48} />
                            <p>No projects yet. <Link href="/projects" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', marginTop: 12 }}><Plus size={14} /> Create Project</Link></p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {projects.map((project: any) => (
                                <Link key={project.id} href={`/projects/${project.id}`} style={{ display: 'block' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'border-color 0.2s', flexWrap: 'wrap' }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                                    >
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{project.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{project.members?.length || 0} members · {project.leader?.name || 'No leader'}</div>
                                        </div>
                                        <span className={`badge status-${project.status}`}>{project.status.replace('_', ' ')}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                                            <div className="progress-bar" style={{ flex: 1 }}>
                                                <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                                            </div>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, minWidth: 36 }}>{project.progress}%</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
