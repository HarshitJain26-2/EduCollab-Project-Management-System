'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_ICONS: Record<string, string> = {
    task_assigned: '📋', meeting_scheduled: '📅', deadline_approaching: '⏰',
    update_approved: '✅', update_revision: '🔄', guide_comment: '💬', project_added: '🚀', general: '🔔',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = () => {
        setLoading(true);
        api.get('/notifications').then(r => setNotifications(r.data.notifications || []))
            .catch(() => toast.error('Failed to load notifications')).finally(() => setLoading(false));
    };

    const markRead = async (id: string) => {
        await api.patch(`/notifications/${id}/read`).catch(() => { });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = async () => {
        await api.patch('/notifications/read-all').catch(() => toast.error('Failed'));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read');
    };

    const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) return <DashboardLayout><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Notifications</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all read</button>
                    )}
                </div>

                <div className="tabs">
                    <div className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({notifications.length})</div>
                    <div className={`tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>Unread ({unreadCount})</div>
                </div>

                {displayed.length === 0 ? (
                    <div className="empty-state card" style={{ padding: 60 }}>
                        <BellOff size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {filter === 'unread' ? 'All caught up! 🎉' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {displayed.map((n: any, i) => (
                            <div
                                key={n.id}
                                className={`notif-item ${!n.read ? 'unread' : ''}`}
                                onClick={() => !n.read && markRead(n.id)}
                                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px', borderBottom: i < displayed.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                            >
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: !n.read ? 'rgba(108,99,255,0.15)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                    {NOTIF_ICONS[n.type] || '🔔'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                        <div style={{ fontWeight: !n.read ? 700 : 500, fontSize: 14, color: 'var(--text-primary)' }}>{n.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{n.message}</div>
                                    {!n.read && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                        <div className="notif-dot" style={{ width: 6, height: 6 }} />
                                        <span style={{ fontSize: 11, color: 'var(--accent-secondary)', fontWeight: 600 }}>Unread — click to mark as read</span>
                                    </div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
