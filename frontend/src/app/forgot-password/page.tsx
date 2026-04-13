'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Mail, BookOpen, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Reset instructions sent!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <BookOpen size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Forgot your password?</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter your email and we&apos;ll send you a reset link.</p>
                </div>

                <div className="card" style={{ padding: 36 }}>
                    {sent ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Check your email</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                                If an account exists for <strong>{email}</strong>, you&apos;ll receive password reset instructions.
                            </p>
                            <Link href="/login" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}><ArrowLeft size={16} /> Back to Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group">
                                <label className="label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? <div className="spinner" /> : 'Send Reset Link'}
                            </button>
                            <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
                                <Link href="/login" style={{ color: 'var(--accent-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Back to login</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
