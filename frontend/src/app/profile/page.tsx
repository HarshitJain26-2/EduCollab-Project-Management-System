'use client';
import { useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    avatar: user?.avatar || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser(res.data?.user || res.data);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[--primary] mb-8">Your Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-[--outline-variant]/10 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[--primary] to-[--primary-container]" />
          <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-8 inline-block">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 overflow-hidden">
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block px-1">Full Name</label>
                  <input
                    className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block px-1">College / University</label>
                  <input
                    className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block px-1">Avatar URL</label>
                <input
                  className="w-full p-3 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block px-1">GitHub Profile</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">terminal</span>
                    <input
                      className="w-full p-3 pl-10 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                      placeholder="github.com/username"
                      value={form.github}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-text text-xs uppercase tracking-widest text-[--on-surface-variant] block px-1">LinkedIn Profile</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">link</span>
                    <input
                      className="w-full p-3 pl-10 border border-[--outline-variant] rounded-xl focus:ring-2 focus:ring-[--primary]/20 focus:border-[--primary] outline-none text-sm"
                      placeholder="linkedin.com/in/username"
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-[--primary] text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
