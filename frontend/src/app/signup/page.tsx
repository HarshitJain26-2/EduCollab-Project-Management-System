'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
type Role = 'guide' | 'leader' | 'member';

const roles: { value: Role; label: string; icon: string; description: string }[] = [
  { value: 'guide', label: 'Guide', icon: 'psychology', description: 'Teacher / Mentor overseeing projects' },
  { value: 'leader', label: 'Leader', icon: 'leaderboard', description: 'Student lead managing the team' },
  { value: 'member', label: 'Member', icon: 'group', description: 'Student working on tasks' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', college: '', password: '', role: 'member' as Role });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.college) return toast.error('Please fill in all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, form);
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--background]">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[--primary-fixed-dim]/30 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] bg-[--secondary-fixed-dim]/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[5%] left-[20%] w-[30%] h-[30%] bg-[--tertiary-fixed-dim]/20 blur-[80px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <Link href="/" className="text-xl font-black text-indigo-600">EduCollab</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="label-text text-xs text-[--on-surface-variant] hover:text-[--primary] transition-colors">Sign In</Link>
          <button className="bg-[--primary] text-white px-4 py-2 rounded-xl label-text text-xs shadow-md active:scale-95 transition-all">
            Get Started
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-[480px]">
          <div className="glass-panel rounded-[32px] p-8 md:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[--on-surface] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Create Account</h1>
              <p className="text-[--on-surface-variant]">Join the collaborative academic community.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="label-text text-xs text-[--on-surface-variant] px-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[--outline]">person</span>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="reg-email" className="label-text text-xs text-[--on-surface-variant] px-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[--outline]">mail</span>
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@university.edu"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* College */}
              <div className="space-y-2">
                <label htmlFor="college" className="label-text text-xs text-[--on-surface-variant] px-1">College / University</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[--outline]">school</span>
                  <input
                    id="college"
                    type="text"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    placeholder="Stanford University"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-3">
                <label className="label-text text-xs text-[--on-surface-variant] px-1">Select Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        form.role === r.value
                          ? 'border-[--primary] bg-[--primary]/5 text-[--primary]'
                          : 'border-[--outline-variant] bg-white text-[--on-surface-variant] hover:border-[--primary]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined">{r.icon}</span>
                      <span className="label-text text-xs font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[--on-surface-variant] px-1">
                  {roles.find((r) => r.value === form.role)?.description}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="reg-password" className="label-text text-xs text-[--on-surface-variant] px-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[--outline]">lock</span>
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] transition-all outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[--outline] hover:text-[--primary] transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[--primary] text-white rounded-xl font-bold shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[--on-surface-variant]">
              Already have an account?{' '}
              <Link href="/login" className="text-[--primary] font-semibold hover:underline">Log in</Link>
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-6">
              {[
                { icon: 'verified_user', text: 'Secure Encryption' },
                { icon: 'history_edu', text: 'Academic Standards' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-[--on-surface-variant]/60">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-xs font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
