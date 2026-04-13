'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
    BookOpen, LayoutDashboard, FolderOpen, CheckSquare, FileText,
    Calendar, Bell, Upload, Github, HardDrive, LogOut, Menu, X,
    Sun, Moon, User, ChevronDown
} from 'lucide-react';

const navItems = {
    guide: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderOpen },
        { href: '/tasks', label: 'Tasks', icon: CheckSquare },
        { href: '/updates', label: 'Daily Updates', icon: FileText },
        { href: '/meetings', label: 'Meetings', icon: Calendar },
        { href: '/files', label: 'Files', icon: Upload },
        { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
    leader: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderOpen },
        { href: '/tasks', label: 'Tasks', icon: CheckSquare },
        { href: '/updates', label: 'Daily Updates', icon: FileText },
        { href: '/meetings', label: 'Meetings', icon: Calendar },
        { href: '/files', label: 'Files', icon: Upload },
        { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
    member: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'My Projects', icon: FolderOpen },
        { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
        { href: '/updates', label: 'Daily Updates', icon: FileText },
        { href: '/meetings', label: 'Meetings', icon: Calendar },
        { href: '/files', label: 'Files', icon: Upload },
        { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
};

export default function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        document.documentElement.className = darkMode ? '' : 'light';
    }, [darkMode]);

    const items = user ? navItems[user.role] : [];
    const roleColors = { guide: '#f472b6', leader: '#22d3ee', member: '#34d399' };
    const roleColor = user ? roleColors[user.role] : '#6c63ff';

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 10, cursor: 'pointer', color: 'var(--text-primary)' }}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 39, display: 'none' }} className="mobile-overlay" />
            )}

            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BookOpen size={20} color="white" />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduCollab</span>
                    </Link>
                </div>

                {/* Role Badge */}
                {user && (
                    <div style={{ margin: '12px 16px', padding: '10px 14px', background: `${roleColor}10`, borderRadius: 10, border: `1px solid ${roleColor}30` }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Logged in as</div>
                        <div style={{ fontSize: 13, color: roleColor, fontWeight: 700, marginTop: 2, textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
                    {items.map(item => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon size={18} />
                                {item.label}
                                {item.href === '/notifications' && unreadCount > 0 && (
                                    <span style={{ marginLeft: 'auto', background: 'var(--accent-red)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div style={{ padding: '12px 12px 20px', borderTop: '1px solid var(--border-color)' }}>
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: '1px solid var(--border-color)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', marginBottom: 8 }}
                    >
                        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    {/* User info */}
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', background: showUserMenu ? 'var(--bg-secondary)' : 'transparent' }}
                    >
                        <div className="avatar" style={{ background: roleColor }}>
                            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : getInitials(user?.name || '')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.college || user?.email}</div>
                        </div>
                        <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {showUserMenu && (
                        <div style={{ padding: '4px 0' }}>
                            <Link href="/profile" className="sidebar-link" style={{ fontSize: 13 }} onClick={() => { setShowUserMenu(false); setMobileOpen(false); }}>
                                <User size={16} /> My Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="sidebar-link btn-danger"
                                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', fontSize: 13, margin: '2px 8px', padding: '10px 16px' }}
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
        </>
    );
}
