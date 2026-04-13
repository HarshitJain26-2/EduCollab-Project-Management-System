'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Building, BookOpen } from 'lucide-react';

export default function SignupPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'member', college: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const roles = [
        { value: 'guide', label: 'Guide / Mentor', desc: 'Supervise projects', color: '#f472b6' },
        { value: 'leader', label: 'Group Leader', desc: 'Lead your team', color: '#22d3ee' },
        { value: 'member', label: 'Team Member', desc: 'Contribute to projects', color: '#34d399' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: form.role, college: form.college });
            login(data.token, data.user);
            toast.success(`Account created! Welcome, ${data.user.name}.`);
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 600 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={24} color="white" />
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduCollab</span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Create your account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join your team and start collaborating today</p>
                </div>

                <div className="card" style={{ padding: 40 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Role Selection */}
                        <div className="form-group">
                            <label className="label">I am a...</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {roles.map(r => (
                                    <div
                                        key={r.value}
                                        onClick={() => setForm({ ...form, role: r.value })}
                                        style={{
                                            padding: '14px 12px', borderRadius: 12, border: `2px solid ${form.role === r.value ? r.color : 'var(--border-color)'}`,
                                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                                            background: form.role === r.value ? `${r.color}15` : 'var(--bg-secondary)',
                                        }}
                                    >
                                        <div style={{ fontSize: 13, fontWeight: 700, color: form.role === r.value ? r.color : 'var(--text-primary)' }}>{r.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{r.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">College / Organization</label>
                                <div style={{ position: 'relative' }}>
                                    <Building size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input" style={{ paddingLeft: 40 }} type="text" placeholder="MIT, IIT, etc." value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="input" style={{ paddingLeft: 40, paddingRight: 40 }}
                                        type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? <div className="spinner" /> : <><UserPlus size={18} /> Create Account</>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
