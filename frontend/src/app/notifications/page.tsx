'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data?.notifications || res.data || []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  return (
    <AppLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[--primary] mb-1">Notifications</h1>
          <p className="text-[--on-surface-variant]">Stay updated with your team's latest activities.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-[--primary] label-text text-xs font-bold uppercase tracking-widest hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-24 shadow-sm border border-slate-100" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">notifications_none</span>
          <h3 className="text-xl font-bold mb-2">No notifications</h3>
          <p className="text-[--on-surface-variant]">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-5 rounded-2xl border transition-all ${n.read ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50/50 border-blue-100 shadow-sm shadow-blue-500/5'}`}>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {n.type === 'task' ? 'task' : n.type === 'update' ? 'history_edu' : 'notifications'}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm">{n.title}</h3>
                    <span className="text-[10px] label-text text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[--on-surface-variant] leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
