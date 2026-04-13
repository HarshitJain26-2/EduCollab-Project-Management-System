'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, X, Github, ExternalLink, Calendar, CheckCircle, Clock, Trash2, Edit, FileText, Link as LinkIcon, MoreVertical, ArrowLeft, HardDrive } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { format } from 'date-fns';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamForm, setTeamForm] = useState({ leader: '', members: [] as string[] });
    const [driveForm, setDriveForm] = useState({ title: '', url: '', category: 'folder' });
    const [githubEdit, setGithubEdit] = useState(false);
    const [githubLink, setGithubLink] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const requests: any[] = [
            api.get(`/projects/${id}`),
            api.get(`/tasks?project=${id}`),
            api.get(`/meetings?project=${id}`),
            api.get(`/updates?project=${id}`),
        ];

        if (user?.role === 'guide') {
            const collegeParam = user.college ? `?college=${encodeURIComponent(user.college)}` : '';
            requests.push(api.get(`/users${collegeParam}`));
        }

        Promise.all(requests).then(([pRes, tRes, mRes, uRes, uListRes]) => {
            const proj = pRes.data.project;
            setProject(proj);
            setGithubLink(proj.githubLink || '');
            setTasks(tRes.data.tasks || []);
            setMeetings(mRes.data.meetings || []);
            setUpdates(uRes.data.updates || []);
            
            if (uListRes) {
                setAllUsers(uListRes.data.users || []);
            }

            // Initialize team form
            setTeamForm({
                leader: proj.leader?.id || '',
                members: (proj.members || []).map((m: any) => m.id)
            });
        }).catch(() => toast.error('Failed to load project'))
            .finally(() => setLoading(false));
    }, [id, user]);

    const getInitials = (name: string) => name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    const addDriveLink = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post(`/projects/${id}/drive-links`, driveForm);
            setProject({ ...project, driveLinks: res.data.driveLinks });
            setShowDriveModal(false);
            setDriveForm({ title: '', url: '', category: 'folder' });
            toast.success('Resource added!');
        } catch { toast.error('Failed to add resource'); }
    };

    const removeDriveLink = async (linkId: string) => {
        try {
            const res = await api.delete(`/projects/${id}/drive-links/${linkId}`);
            setProject({ ...project, driveLinks: res.data.driveLinks });
            toast.success('Resource removed');
        } catch { toast.error('Failed to remove resource'); }
    };

    const toggleTeamMember = (memberId: string) => {
        setTeamForm(prev => ({
            ...prev,
            members: prev.members.includes(memberId) 
                ? prev.members.filter(id => id !== memberId)
                : [...prev.members, memberId]
        }));
    };

    const saveTeam = async () => {
        try {
            const res = await api.put(`/projects/${id}`, { 
                leader: teamForm.leader, 
                members: teamForm.members 
            });
            setProject(res.data.project);
            setShowTeamModal(false);
            toast.success('Team updated successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update team');
        }
    };

    const saveGithubLink = async () => {
        try {
            await api.put(`/projects/${id}`, { githubLink });
            setProject({ ...project, githubLink });
            setGithubEdit(false);
            toast.success('GitHub link saved!');
        } catch { toast.error('Failed to save'); }
    };

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;
    if (!project) return <DashboardLayout><div className="empty-state" style={{ paddingTop: 80 }}><p>Project not found</p><Link href="/projects" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Projects</Link></div></DashboardLayout>;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const roleColors: any = { guide: '#f472b6', leader: '#22d3ee', member: '#34d399' };

    const TABS = [
        { key: 'overview', label: 'Overview' },
        { key: 'tasks', label: `Tasks (${tasks.length})` },
        { key: 'updates', label: `Updates (${updates.length})` },
        { key: 'meetings', label: `Meetings (${meetings.length})` },
        { key: 'github', label: 'GitHub' },
        { key: 'drive', label: `Drive (${project.driveLinks?.length || 0})` },
    ];

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                {/* Back + header */}
                <div style={{ marginBottom: 24 }}>
                    <button onClick={() => router.push('/projects')} className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={14} /> Back to Projects</button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{project.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{project.description}</p>
                        </div>
                        <span className={`badge status-${project.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>{project.status.replace('_', ' ')}</span>
                    </div>
                    {/* Progress */}
                    <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="progress-bar" style={{ flex: 1, height: 10 }}><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-secondary)', minWidth: 48 }}>{project.progress}%</span>
                    </div>
                    {/* Team */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
                        {project.guide && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm" style={{ background: '#f472b6' }}>{getInitials(project.guide.name)}</div><div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>GUIDE</div><div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{project.guide.name}</div></div></div>}
                        {project.leader && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm" style={{ background: '#22d3ee' }}>{getInitials(project.leader.name)}</div><div><div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>LEADER</div><div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{project.leader.name}</div></div></div>}
                        {project.members?.length > 0 && <div style={{ display: 'flex', gap: -4 }}>
                            {project.members.slice(0, 6).map((m: any, i: number) => (
                                <div key={m.id} className="avatar avatar-sm" title={m.name} style={{ border: '2px solid var(--bg-primary)', marginLeft: i > 0 ? -8 : 0, zIndex: i, background: '#34d399' }}>{getInitials(m.name)}</div>
                            ))}
                            {project.members.length > 6 && <div className="avatar avatar-sm" style={{ border: '2px solid var(--bg-primary)', marginLeft: -8, background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 9 }}>+{project.members.length - 6}</div>}
                        </div>}
                        {user?.role === 'guide' && user.id === project.guideId && (
                            <button onClick={() => setShowTeamModal(true)} className="btn btn-secondary btn-sm" style={{ borderRadius: 20, padding: '4px 12px' }}><Plus size={14} /> Manage Team</button>
                        )}
                    </div>
                </div>

                {/* Team Modal Constants */}
                {(() => {
                    const leaders = allUsers.filter(u => u.role === 'leader');
                    const filteredMembers = allUsers.filter(u => 
                        u.role === 'member' && 
                        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    );
                    (window as any)._projectLeaders = leaders;
                    (window as any)._projectFilteredMembers = filteredMembers;
                })()}

                {/* Tabs */}
                <div className="tabs">
                    {TABS.map(t => <div key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</div>)}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                        {[
                            { label: 'Total Tasks', value: tasks.length, color: '#6c63ff' },
                            { label: 'Completed', value: completedTasks, color: '#34d399' },
                            { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#22d3ee' },
                            { label: 'Team Members', value: project.members?.length || 0, color: '#f472b6' },
                            { label: 'Updates', value: updates.length, color: '#fbbf24' },
                            { label: 'Meetings', value: meetings.length, color: '#a78bfa' },
                        ].map(s => (
                            <div key={s.label} className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            {(user?.role === 'guide' || user?.role === 'leader') && <Link href="/tasks" className="btn btn-primary btn-sm"><Plus size={14} /> Add Task</Link>}
                        </div>
                        {tasks.length === 0 ? <div className="empty-state card" style={{ padding: 40 }}>No tasks for this project</div> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tasks.map(t => (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{t.title}</span>
                                        <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                                        <span className={`badge status-${t.status}`}>{t.status.replace('_', ' ')}</span>
                                        {t.assignedTo && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}><div className="avatar avatar-sm">{getInitials(t.assignedTo.name)}</div>{t.assignedTo.name}</div>}
                                        {t.deadline && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.deadline).toLocaleDateString()}</span>}
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {activeTab === 'updates' && (
                    <div>
                        {updates.length === 0 ? <div className="empty-state card" style={{ padding: 40 }}>No daily updates yet</div> :
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {updates.slice(0, 5).map(u => (
                                    <div key={u.id} className="card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar avatar-sm">{getInitials(u.member?.name || '')}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{u.member?.name}</span>
                                            </div>
                                            <span className={`badge ${u.status === 'approved' ? 'badge-green' : u.status === 'revision_requested' ? 'badge-red' : 'badge-yellow'}`}>{u.status}</span>
                                        </div>
                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{u.workCompleted}</p>
                                    </div>
                                ))}
                                <Link href="/updates" style={{ color: 'var(--accent-secondary)', fontSize: 14, textAlign: 'center', marginTop: 8 }}>View all updates →</Link>
                            </div>
                        }
                    </div>
                )}

                {activeTab === 'meetings' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            {(user?.role === 'guide' || user?.role === 'leader') && <Link href="/meetings" className="btn btn-primary btn-sm"><Plus size={14} /> Schedule Meeting</Link>}
                        </div>
                        {meetings.length === 0 ? <div className="empty-state card" style={{ padding: 40 }}>No meetings scheduled</div> :
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                {meetings.map(m => (
                                    <div key={m.id} className="card" style={{ padding: 20 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>{m.title}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{new Date(m.date).toLocaleDateString()} at {m.time}</div>
                                        {m.agenda && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{m.agenda}</p>}
                                        {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><ExternalLink size={12} /> Join</a>}
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

                {activeTab === 'github' && (
                    <div className="card" style={{ padding: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Github size={28} color="var(--text-primary)" />
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>GitHub Repository</h3>
                        </div>
                        {githubEdit ? (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input className="input" type="url" placeholder="https://github.com/..." value={githubLink} onChange={e => setGithubLink(e.target.value)} style={{ flex: 1 }} />
                                <button className="btn btn-primary" onClick={saveGithubLink}>Save</button>
                                <button className="btn btn-secondary" onClick={() => setGithubEdit(false)}>Cancel</button>
                            </div>
                        ) : project.githubLink ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                                    <Github size={20} color="var(--text-primary)" />
                                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: 15, flex: 1, wordBreak: 'break-all' }}>{project.githubLink}</a>
                                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><ExternalLink size={14} /> Open</a>
                                </div>
                                {(user?.role === 'guide' || user?.role === 'leader') && <button className="btn btn-secondary btn-sm" onClick={() => setGithubEdit(true)} style={{ alignSelf: 'flex-start' }}>Edit Link</button>}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Github size={48} />
                                <p>No GitHub repository linked yet</p>
                                {(user?.role === 'guide' || user?.role === 'leader') && <button className="btn btn-primary" onClick={() => setGithubEdit(true)} style={{ marginTop: 16 }}><Plus size={16} /> Add GitHub Link</button>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'drive' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: 16 }}>Shared Resources</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowDriveModal(true)}><Plus size={14} /> Add Resource</button>
                        </div>
                        {!project.driveLinks?.length ? (
                            <div className="empty-state card" style={{ padding: 40 }}>
                                <HardDrive size={48} />
                                <p>No Drive resources added yet</p>
                                <button className="btn btn-primary" onClick={() => setShowDriveModal(true)} style={{ marginTop: 16 }}><Plus size={16} /> Add Resource</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                {project.driveLinks.map((link: any) => (
                                    <div key={link.id} className="card" style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <span className={`badge badge-purple`} style={{ textTransform: 'capitalize' }}>{link.category}</span>
                                            {(user?.role === 'guide' || user?.role === 'leader') && <button onClick={() => removeDriveLink(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: 4 }}><Trash2 size={13} /></button>}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{link.title}</div>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}><HardDrive size={14} /> Open in Drive</a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Team Management Modal */}
            {showTeamModal && (
                <div className="modal-overlay" onClick={(e: any) => e.target === e.currentTarget && setShowTeamModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Manage Group Team</h2>
                            <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="label">Group Leader</label>
                                <CustomSelect 
                                    options={allUsers.filter(u => u.role === 'leader').map(l => ({ id: l.id, name: l.name }))} 
                                    value={teamForm.leader} 
                                    onChange={val => setTeamForm({ ...teamForm, leader: val })} 
                                    label="Select leader"
                                    width="100%"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Members ({teamForm.members.length} selected)</label>
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
                                    height: 200, 
                                    overflowY: 'auto', 
                                    background: 'var(--bg-secondary)', 
                                    borderRadius: 8, 
                                    border: '1px solid var(--border-color)',
                                    padding: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                }}>
                                    {(allUsers.filter(u => u.role === 'member' && (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())))).map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => toggleTeamMember(m.id)}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 10, 
                                                padding: '8px 12px', 
                                                borderRadius: 6,
                                                cursor: 'pointer',
                                                background: teamForm.members.includes(m.id) ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                                                transition: 'background 0.2s',
                                                border: teamForm.members.includes(m.id) ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid transparent'
                                            }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={teamForm.members.includes(m.id)} 
                                                onChange={() => {}} 
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTeamModal(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveTeam}>Update Team</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drive Link Modal */}
            {showDriveModal && (
                <div className="modal-overlay" onClick={(e: any) => e.target === e.currentTarget && setShowDriveModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Add Drive Resource</h2>
                            <button onClick={() => setShowDriveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={addDriveLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="label">Title *</label>
                                <input className="input" type="text" placeholder="e.g. Project Research Papers" value={driveForm.title} onChange={e => setDriveForm({ ...driveForm, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Category</label>
                                <select className="input" value={driveForm.category} onChange={e => setDriveForm({ ...driveForm, category: e.target.value })}>
                                    <option value="folder">Folder</option>
                                    <option value="research">Research Papers</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="dataset">Dataset</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Google Drive URL *</label>
                                <input className="input" type="url" placeholder="https://drive.google.com/..." value={driveForm.url} onChange={e => setDriveForm({ ...driveForm, url: e.target.value })} required />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDriveModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
