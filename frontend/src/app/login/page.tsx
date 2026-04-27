'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = res.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[--background] text-[--on-surface] min-h-screen flex items-center justify-center p-4 overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[--primary-fixed] to-[--secondary-fixed] opacity-40" />
        <div className="absolute inset-0 academic-pattern opacity-5" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[--primary-container] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[--secondary-container] rounded-full blur-[100px] opacity-20" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="glass-panel rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <header className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-[--primary-container] rounded-xl flex items-center justify-center shadow-lg mb-4">
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
            </div>
            <h1 className="text-4xl font-bold text-[--primary] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>EduCollab</h1>
            <p className="text-[--on-surface-variant] text-center mt-2">Your collaborative academic hub</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="label-text text-xs text-[--on-surface-variant] flex items-center gap-1 uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full h-12 px-4 rounded-xl bg-white/50 border border-[--outline-variant] focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 transition-all outline-none text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="label-text text-xs text-[--on-surface-variant] flex items-center gap-1 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Password
                </label>
                <Link href="/forgot-password" className="label-text text-xs text-[--primary] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/50 border border-[--outline-variant] focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 transition-all outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[--on-surface-variant] hover:text-[--primary] transition-colors"
                >
                  <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-[--outline-variant] text-[--primary] focus:ring-[--primary]"
              />
              <label htmlFor="remember" className="text-xs text-[--on-surface-variant]">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[--primary] text-white font-semibold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined">login</span>}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center w-full gap-4">
              <div className="h-px flex-1 bg-[--outline-variant]/30" />
              <span className="label-text text-[10px] text-[--on-surface-variant]">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-[--outline-variant]/30" />
            </div>
            <p className="text-sm text-[--on-surface-variant] mt-2">
              New to EduCollab?{' '}
              <Link href="/signup" className="text-[--primary] font-semibold hover:underline">
                Register now
              </Link>
            </p>
          </div>
        </div>

        <footer className="mt-6 text-center">
          <p className="label-text text-[10px] text-[--on-surface-variant] opacity-60">
            © 2024 EduCollab Platform. All academic rights reserved.
          </p>
        </footer>
      </main>

      {/* Desktop tip card */}
      <div className="fixed top-20 right-8 hidden lg:block max-w-xs">
        <div className="glass-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[--secondary-container] flex items-center justify-center">
              <span className="material-symbols-outlined text-[--on-secondary-container]">tips_and_updates</span>
            </div>
            <div>
              <h3 className="label-text text-xs font-bold text-[--on-surface]">Pro Tip</h3>
              <p className="text-[11px] text-[--on-surface-variant] leading-tight">
                Use your university email for automatic group placement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
