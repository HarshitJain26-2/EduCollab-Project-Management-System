'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TopNav from '@/components/ui/TopNav';
import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--background]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="label-text text-xs uppercase tracking-widest text-slate-500">Loading EduCollab…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[--background]">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
