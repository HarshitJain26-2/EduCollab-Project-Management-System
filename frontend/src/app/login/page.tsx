'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Mail, Lock, BookOpen } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
            login(data.token, data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-primary)',
        }}>
            {/* Left Panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', padding: '60px 40px',
                background: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 50%, #16213e 100%)',
                position: 'relative', overflow: 'hidden',
            }} className="hidden-mobile">
                {/* Decorative orbs */}
                <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 48 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={28} color="white" />
                        </div>
                        <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduCollab</span>
                    </div>

                    <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.3 }}>
                        Collaborate. Track. Succeed.
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7 }}>
                        Your complete project management solution for college groups. Guides, leaders, and members all in one place.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 48 }}>
                        {[
                            { label: 'Projects Managed', value: '500+', color: '#6c63ff' },
                            { label: 'Active Teams', value: '120+', color: '#22d3ee' },
                            { label: 'Tasks Completed', value: '8K+', color: '#34d399' },
                            { label: 'Happy Users', value: '1K+', color: '#f472b6' },
                        ].map(stat => (
                            <div key={stat.label} className="glass" style={{ padding: '20px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
                    {/* Mobile Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={22} color="white" />
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduCollab</span>
                    </div>

                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 36 }}>Sign in to your account to continue</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label className="label">Email / PRN</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 40 }}
                                    type="email"
                                    placeholder="you@college.edu"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 40, paddingRight: 40 }}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={form.rememberMe} onChange={e => setForm({ ...form, rememberMe: e.target.checked })} style={{ accentColor: 'var(--accent-primary)' }} />
                                Remember me
                            </label>
                            <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-secondary)' }}>Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
                            {loading ? <div className="spinner" /> : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Sign up</Link>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          div[style*="flex: 0 0 480px"] { flex: 1 !important; padding: 40px 24px !important; }
        }
      `}</style>
        </div>
    );
}
