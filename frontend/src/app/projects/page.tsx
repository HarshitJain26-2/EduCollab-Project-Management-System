'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, FolderOpen, Users, X, Github, HardDrive, Trash2, Edit } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function ProjectsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', description: '', leader: '', members: [] as string[], githubLink: '', startDate: '', endDate: '', status: 'planning' });
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProjects();
        if (user?.role === 'guide') {
            const collegeParam = user.college ? `college=${encodeURIComponent(user.college)}` : '';
            api.get(`/users?${collegeParam}`).then(r => setAllUsers(r.data.users || [])).catch(() => { });
        }
    }, [user]);

    const fetchProjects = () => {
        setLoading(true);
        api.get('/projects').then(r => setProjects(r.data.projects || [])).catch(() => toast.error('Failed to load projects')).finally(() => setLoading(false));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/projects', { ...form, timeline: { startDate: form.startDate, endDate: form.endDate } });
            toast.success('Project created!');
            setShowModal(false);
            setForm({ name: '', description: '', leader: '', members: [], githubLink: '', startDate: '', endDate: '', status: 'planning' });
            fetchProjects();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create project');
        } finally {
            setSaving(false);
        }
    };

    const toggleMember = (memberId: string) => {
        setForm(prev => ({
            ...prev,
            members: prev.members.includes(memberId) 
                ? prev.members.filter(id => id !== memberId)
                : [...prev.members, memberId]
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            toast.success('Project deleted');
            fetchProjects();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete project');
        }
    };

    const leaders = allUsers.filter(u => u.role === 'leader');
    const filteredMembers = allUsers.filter(u => 
        u.role === 'member' && 
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const statusColors: any = { planning: '#6c63ff', active: '#22d3ee', on_hold: '#fbbf24', completed: '#34d399' };

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Projects</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                    </div>
                    {user?.role === 'guide' && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Project</button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
                ) : projects.length === 0 ? (
                    <div className="empty-state card" style={{ padding: 60 }}>
                        <FolderOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>No projects yet</p>
                        {user?.role === 'guide' && <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 16 }}><Plus size={16} /> Create Your First Project</button>}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                        {projects.map((p: any) => (
                            <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Color header */}
                                <div style={{ height: 6, background: `linear-gradient(90deg, ${statusColors[p.status] || '#6c63ff'}, ${statusColors[p.status] || '#6c63ff'}88)` }} />
                                <div style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>{p.name}</h3>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span className={`badge status-${p.status}`}>{p.status.replace('_', ' ')}</span>
                                            {user?.role === 'guide' && (
                                                <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: 4 }}><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                    </div>

                                    {p.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>{p.description}</p>}

                                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Users size={14} /> {p.members?.length || 0} members
                                        </span>
                                        {p.leader && <span>👤 {p.leader.name}</span>}
                                        {p.guide && <span>🎓 {p.guide.name}</span>}
                                    </div>

                                    {/* Progress */}
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-secondary)' }}>{p.progress}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                        {p.githubLink && <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Github size={14} /> GitHub</a>}
                                        {p.driveLinks?.length > 0 && <span className="btn btn-secondary btn-sm"><HardDrive size={14} /> {p.driveLinks.length} Resources</span>}
                                    </div>

                                    <Link href={`/projects/${p.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View Project →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Project Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <div className="modal" style={{ maxWidth: 600 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Create New Project</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div className="form-group">
                                    <label className="label">Project Name *</label>
                                    <input className="input" type="text" placeholder="e.g. Smart Attendance System" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Description</label>
                                    <textarea className="input" rows={3} placeholder="Brief description of the project..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Group Leader</label>
                                        <CustomSelect 
                                            options={leaders.map(l => ({ id: l.id, name: l.name }))} 
                                            value={form.leader} 
                                            onChange={val => setForm({ ...form, leader: val })} 
                                            label="Select leader"
                                            width="100%"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Status</label>
                                        <CustomSelect 
                                            options={[
                                                { id: 'planning', name: 'Planning' },
                                                { id: 'active', name: 'Active' },
                                                { id: 'on_hold', name: 'On Hold' },
                                                { id: 'completed', name: 'Completed' }
                                            ]} 
                                            value={form.status} 
                                            onChange={val => setForm({ ...form, status: val })} 
                                            label="Status"
                                            width="100%"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Members ({form.members.length} selected)</label>
                                    <div style={{ position: 'relative', marginBottom: 10 }}>
                                        <input 
                                            type="text" 
                                            className="input" 
                                            placeholder="Search members..." 
                                            style={{ paddingLeft: 12, fontSize: 13, height: 36 }}
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ 
                                        height: 180, 
                                        overflowY: 'auto', 
                                        background: 'var(--bg-secondary)', 
                                        borderRadius: 8, 
                                        border: '1px solid var(--border-color)',
                                        padding: 8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2
                                    }}>
                                        {filteredMembers.length === 0 ? (
                                            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No members found</div>
                                        ) : (
                                            filteredMembers.map(m => (
                                                <div 
                                                    key={m.id} 
                                                    onClick={() => toggleMember(m.id)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 10, 
                                                        padding: '8px 12px', 
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                        background: form.members.includes(m.id) ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                                                        transition: 'background 0.2s',
                                                        border: form.members.includes(m.id) ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid transparent'
                                                    }}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={form.members.includes(m.id)} 
                                                        onChange={() => {}} 
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.college || m.email}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Select one or more team members.</span>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Start Date</label>
                                        <input className="input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">End Date</label>
                                        <input className="input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">GitHub Repository Link</label>
                                    <input className="input" type="url" placeholder="https://github.com/..." value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? <div className="spinner" /> : 'Create Project'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
