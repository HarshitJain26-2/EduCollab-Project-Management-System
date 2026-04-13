'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { User, Shield, Camera, Save, Lock, Mail, School, BadgeCheck, CheckSquare } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    
    // Profile State
    const [profileForm, setProfileForm] = useState({
        name: '',
        college: '',
        avatar: ''
    });

    // Security State
    const [securityForm, setSecurityForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                college: user.college || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.patch('/auth/profile', profileForm);
            updateUser(res.data.user);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        
        setSecurityLoading(true);
        try {
            await api.patch('/auth/change-password', {
                currentPassword: securityForm.currentPassword,
                newPassword: securityForm.newPassword
            });
            toast.success('Password changed successfully!');
            setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSecurityLoading(false);
        }
    };

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const roleColors = { guide: '#f472b6', leader: '#22d3ee', member: '#34d399' };
    const roleColor = user ? roleColors[user.role] : '#6c63ff';

    return (
        <DashboardLayout>
            <div className="animate-fadeIn" style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Account Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Manage your profile information and security settings</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
                    
                    {/* Left Column: Avatar & Quick Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card" style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: 20 }}>
                                <div className="avatar" style={{ width: 120, height: 120, fontSize: 40, border: `4px solid ${roleColor}20`, background: roleColor }}>
                                    {profileForm.avatar ? <img src={profileForm.avatar} alt={user?.name} /> : getInitials(user?.name || '')}
                                </div>
                                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: 8, color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                    <Camera size={18} />
                                </div>
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{user?.name}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${roleColor}15`, color: roleColor, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <BadgeCheck size={14} /> {user?.role}
                            </div>
                            <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border-color)', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                                    <Mail size={16} /> {user?.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                                    <School size={16} /> {user?.college}
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24, borderLeft: `4px solid ${roleColor}` }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Shield size={16} color={roleColor} /> Data Privacy
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                                Your information is secure and only shared with project members and verified guides within EduCollab.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* Personal Information Form */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} />
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Personal Information</h2>
                            </div>

                            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="form-group">
                                    <label className="label">Full Name</label>
                                    <input 
                                        type="text" className="input" placeholder="Enter your full name"
                                        value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">College / Institution <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>(Fixed)</span></label>
                                    <input 
                                        type="text" className="input" placeholder="College name is fixed"
                                        value={profileForm.college} 
                                        disabled
                                        style={{ cursor: 'not-allowed', opacity: 0.7 }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Avatar URL</label>
                                    <input 
                                        type="url" className="input" placeholder="https://example.com/photo.jpg"
                                        value={profileForm.avatar} onChange={e => setProfileForm({...profileForm, avatar: e.target.value})}
                                    />
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Paste a link to your profile picture </p>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 160 }}>
                                        {loading ? <div className="spinner" /> : <><Save size={18} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Form */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lock size={20} />
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Security Settings</h2>
                            </div>

                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div className="form-group">
                                    <label className="label">Current Password</label>
                                    <input 
                                        type="password" className="input" placeholder="••••••••"
                                        value={securityForm.currentPassword} onChange={e => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="label">New Password</label>
                                        <input 
                                            type="password" className="input" placeholder="••••••••"
                                            value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Confirm New Password</label>
                                        <input 
                                            type="password" className="input" placeholder="••••••••"
                                            value={securityForm.confirmPassword} onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                    <button type="submit" className="btn btn-danger" disabled={securityLoading} style={{ minWidth: 160, background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                                        {securityLoading ? <div className="spinner" /> : <><CheckSquare size={18} /> Update Password</>}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
