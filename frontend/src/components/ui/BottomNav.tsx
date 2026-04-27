'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/projects', icon: 'folder_special', label: 'Projects' },
  { href: '/tasks', icon: 'task', label: 'Tasks' },
  { href: '/updates', icon: 'history_edu', label: 'Updates' },
  { href: '/meetings', icon: 'event', label: 'Meetings' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl glass-nav border-t border-white/10 shadow-lg">
      <div className="flex justify-around items-center w-full pb-safe pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all active:scale-95 ${
                isActive
                  ? 'text-blue-700 bg-blue-50/50'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="label-text text-[10px] uppercase tracking-widest font-medium mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
