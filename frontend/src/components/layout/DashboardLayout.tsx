'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import api from '@/lib/axios';
import { useSocket } from '@/context/SocketContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, loading } = useAuth();
    const { socket } = useSocket();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!loading && !isAuthenticated) router.push('/login');
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (!user) return;
        // Fetch initial unread count
        api.get('/notifications').then(res => {
            setUnreadCount(res.data.unreadCount || 0);
        }).catch(() => { });
    }, [user]);

    // Real-time notification counter
    useEffect(() => {
        if (!socket) return;

        const handleNotif = (notification: any) => {
            setUnreadCount(prev => prev + 1);
            // Instant toast is already handled in SocketContext, 
            // but you can add custom logic here if needed.
        };

        socket.on('notification_received', handleNotif);
        return () => { socket.off('notification_received', handleNotif); };
    }, [socket]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar unreadCount={unreadCount} />
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    );
}
