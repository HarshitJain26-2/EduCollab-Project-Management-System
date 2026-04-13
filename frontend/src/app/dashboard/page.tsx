'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'guide') router.replace('/dashboard/guide');
            else if (user.role === 'leader') router.replace('/dashboard/leader');
            else router.replace('/dashboard/member');
        } else if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
    );
}
