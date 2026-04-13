'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import socket from '@/lib/socket';
import toast from 'react-hot-toast';
import { Plus, X, CheckSquare, Circle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import CustomSelect from '@/components/ui/CustomSelect';


const COLUMNS = [
    { key: 'not_started', label: 'Not Started', color: '#475569', bg: 'rgba(71,85,105,0.1)', icon: Circle },
    { key: 'in_progress', label: 'In Progress', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', icon: Clock },
    { key: 'completed', label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.1)', icon: CheckCircle },
];

import { useSocket } from '@/context/SocketContext';

export default function TasksPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', deadline: '', priority: 'medium', status: 'not_started' });
    const [saving, setSaving] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [updatingTask, setUpdatingTask] = useState<string | null>(null);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            api.get('/tasks'),
            api.get('/projects'),
            user?.role !== 'member' ? api.get('/users') : Promise.resolve({ data: { users: [] } })
        ]).then(([tRes, pRes, uRes]) => {
            const fetchedTasks = tRes.data.tasks || [];
            const fetchedProjects = pRes.data.projects || [];
            setTasks(fetchedTasks);
            setProjects(fetchedProjects);
            setAllUsers(uRes.data.users || []);

            // Auto-select if only one project
            if (fetchedProjects.length === 1) {
                setSelectedProject(fetchedProjects[0].id);
                setForm(prev => ({ ...prev, project: fetchedProjects[0].id }));
            }
        }).catch(() => toast.error('Failed to load tasks'))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAll();
    }, [user]);

    // Live real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleTaskAdded = () => fetchAll();
        const handleTaskUpdated = ({ taskId, status }: any) => {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
        };
        const handleNotification = () => {
            // Notifications are handled globally in SocketContext, but we can also refresh state here
        };

        socket.on('task_added', handleTaskAdded);
        socket.on('task_updated', handleTaskUpdated);
        socket.on('notification_received', handleNotification);

        return () => {
            socket.off('task_added', handleTaskAdded);
            socket.off('task_updated', handleTaskUpdated);
            socket.off('notification_received', handleNotification);
        };
    }, [socket]);

    const filteredTasks = selectedProject ? tasks.filter(t => t.project?.id === selectedProject || t.project === selectedProject) : tasks;

    // Check if the current user can change a task's status
    const canChangeStatus = (task: any) => {
        if (!user) return false;
        if (user.role === 'guide' || user.role === 'leader') return true;
        // Member can change status only if the task is assigned to them
        const assignedId = task.assignedTo?.id || task.assignedTo;
        return String(assignedId) === String(user.id);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/tasks', form);
            toast.success('Task created!');
            setShowModal(false);
            setForm({ title: '', description: '', project: '', assignedTo: '', deadline: '', priority: 'medium', status: 'not_started' });
            fetchAll();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create task');
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (taskId: string, status: string) => {
        setUpdatingTask(taskId + status);
        try {
            await api.patch(`/tasks/${taskId}/status`, { status });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
            const label = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Done ✅' }[status] || status;
            toast.success(`Moved to ${label}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingTask(null);
        }
    };

    const getInitials = (name: string) => name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Task Board</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{filteredTasks.length} tasks</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <CustomSelect 
                            options={projects.map(p => ({ id: p.id, name: p.name }))} 
                            value={selectedProject} 
                            onChange={setSelectedProject} 
                            width={200}
                        />
                        {(user?.role === 'guide' || user?.role === 'leader') && (
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Task</button>
                        )}
                    </div>
                </div>

                {/* Kanban Board */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {COLUMNS.map(col => {
                        const colTasks = filteredTasks.filter(t => t.status === col.key);
                        return (
                            <div key={col.key} className="kanban-column">
                                <div className="kanban-header">
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: col.color, flexShrink: 0 }} />
                                    <span style={{ color: col.color }}>{col.label}</span>
                                    <span style={{ marginLeft: 'auto', background: `${col.color}20`, color: col.color, padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{colTasks.length}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {colTasks.map(task => (
                                        <div key={task.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, cursor: 'default', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = col.color; e.currentTarget.style.boxShadow = `0 4px 12px ${col.color}25`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{task.title}</span>
                                                <span className={`badge priority-${task.priority}`} style={{ marginLeft: 8, flexShrink: 0 }}>{task.priority}</span>
                                            </div>
                                            {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}</p>}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {task.assignedTo && <><div className="avatar avatar-sm">{getInitials(task.assignedTo.name)}</div><span>{task.assignedTo.name?.split(' ')[0]}</span></>}
                                                </div>
                                                {task.deadline && <span style={{ fontSize: 11, color: new Date(task.deadline) < new Date() && task.status !== 'completed' ? 'var(--accent-red)' : 'var(--text-muted)' }}>📅 {format(new Date(task.deadline), 'MMM d')}</span>}
                                            </div>
                                            {/* Status actions */}
                                            {canChangeStatus(task) && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                                    {col.key !== 'not_started' && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            disabled={updatingTask === task.id + 'not_started'}
                                                            onClick={() => updateStatus(task.id, 'not_started')}
                                                            style={{ fontSize: 10, padding: '4px 8px' }}
                                                        >
                                                            {updatingTask === task.id + 'not_started' ? <div className="spinner" style={{ width: 10, height: 10 }} /> : '← Not Started'}
                                                        </button>
                                                    )}
                                                    {col.key !== 'in_progress' && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            disabled={updatingTask === task.id + 'in_progress'}
                                                            onClick={() => updateStatus(task.id, 'in_progress')}
                                                            style={{ fontSize: 10, padding: '4px 8px', color: '#22d3ee', borderColor: '#22d3ee40' }}
                                                        >
                                                            {updatingTask === task.id + 'in_progress' ? <div className="spinner" style={{ width: 10, height: 10 }} /> : '⏳ In Progress'}
                                                        </button>
                                                    )}
                                                    {col.key !== 'completed' && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            disabled={updatingTask === task.id + 'completed'}
                                                            onClick={() => updateStatus(task.id, 'completed')}
                                                            style={{ fontSize: 10, padding: '4px 8px', color: '#34d399', borderColor: '#34d39940' }}
                                                        >
                                                            {updatingTask === task.id + 'completed' ? <div className="spinner" style={{ width: 10, height: 10 }} /> : '✓ Mark Done'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13, border: '2px dashed var(--border-color)', borderRadius: 10 }}>
                                            No tasks here
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Create New Task</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="label">Task Title *</label>
                                <input className="input" type="text" placeholder="e.g. Design login page" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Description</label>
                                <textarea className="input" rows={3} placeholder="Task details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Project *</label>
                                    <CustomSelect 
                                        options={projects.map(p => ({ id: p.id, name: p.name }))} 
                                        value={form.project} 
                                        onChange={val => {
                                            setForm(prev => ({ ...prev, project: val, assignedTo: '' }));
                                        }} 
                                        label="Select project"
                                        width="100%"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Assign To</label>
                                    <CustomSelect 
                                        options={(() => {
                                            const proj = projects.find(p => p.id === form.project);
                                            if (!proj) return [];
                                            const eligible = [...(proj.members || [])];
                                            if (proj.leader && !eligible.find(m => m.id === proj.leader.id)) {
                                                eligible.push(proj.leader);
                                            }
                                            return eligible.map(u => ({ id: u.id, name: `${u.name} (${u.role})` }));
                                        })()} 
                                        value={form.assignedTo} 
                                        onChange={val => setForm(prev => ({ ...prev, assignedTo: val }))} 
                                        label={form.project ? "Select member" : "Select project first"}
                                        width="100%"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="label">Priority</label>
                                    <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Deadline</label>
                                    <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? <div className="spinner" /> : 'Create Task'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
