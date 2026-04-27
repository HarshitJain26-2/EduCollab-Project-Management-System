'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/updates', label: 'Updates' },
  { href: '/meetings', label: 'Meetings' },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-white/20 shadow-sm">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {initials}
            </div>
          )}
          <span className="text-2xl serif-italic text-slate-900">EduCollab</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`label-text text-sm tracking-wide uppercase h-full flex items-center border-b-2 transition-colors ${
                  isActive
                    ? 'text-blue-700 border-blue-700 font-bold'
                    : 'text-slate-500 border-transparent hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="p-2 rounded-full hover:bg-slate-100/50 transition-all active:scale-95">
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-full hover:bg-slate-100/50 transition-all"
            >
              <Link href="/profile">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
              </Link>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1 label-text text-xs uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
