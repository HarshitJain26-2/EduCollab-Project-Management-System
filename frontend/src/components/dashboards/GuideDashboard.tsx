'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  members?: { id: string; name: string; avatar?: string }[];
}

export default function GuideDashboard() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data?.projects || res.data || []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  const categoryColors = ['bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];

  return (
    <div>
      {/* Header */}
      <section className="mb-12">
        <p className="label-text text-[#6d5e00] uppercase tracking-widest text-xs font-semibold mb-2">
          Academic Overview
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[--on-background] leading-tight">
          Curating Excellence.
        </h1>
        <p className="text-[--on-surface-variant] mt-2 max-w-2xl">
          Manage and monitor team progress across your active research and collaborative projects.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Project Grid */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold">Active Engagements</h2>
            <Link href="/projects" className="text-[--primary] font-semibold text-sm hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[--surface-container-low] p-6 rounded-xl animate-pulse h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p, i) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <div className="bg-[--surface-container-low] p-6 rounded-xl space-y-4 hover:bg-[--surface-container] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className={`label-text text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded ${categoryColors[i % categoryColors.length]}`}>
                        {p.status}
                      </span>
                      <span className="text-[--on-surface-variant] text-xs label-text">
                        {p.members?.length ?? 0} Members
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug">{p.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs label-text font-medium">
                        <span className="text-[--on-surface-variant]">Progress</span>
                        <span className="text-[--primary]">{p.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[--surface-variant] rounded-full overflow-hidden">
                        <div className="h-full bg-[--primary] rounded-full transition-all duration-700" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                    {p.members && p.members.length > 0 && (
                      <div className="pt-2 flex -space-x-2">
                        {p.members.slice(0, 4).map((m) => (
                          <div key={m.id} className="w-6 h-6 rounded-full border-2 border-[--surface-container-low] bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 overflow-hidden">
                            {m.avatar ? (
                              <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name?.[0]?.toUpperCase()
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}

              {/* Add New Project card */}
              <Link href="/projects">
                <div className="border-2 border-dashed border-[--outline-variant]/50 p-6 rounded-xl flex flex-col items-center justify-center space-y-3 hover:border-[--primary]/50 transition-colors cursor-pointer group min-h-[180px]">
                  <div className="w-10 h-10 rounded-full bg-[--primary]/5 flex items-center justify-center text-[--primary] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <span className="label-text font-semibold text-sm">Initiate New Guided Project</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Attention + Milestones */}
        <div className="lg:col-span-4 space-y-8">
          {/* Attention Needed */}
          <div className="bg-red-50/60 p-6 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[--error]">priority_high</span>
              <h2 className="text-lg font-bold">Attention Needed</h2>
            </div>
            <div className="space-y-6">
              {projects
                .filter((p) => p.status === 'on_hold' || p.progress < 30)
                .slice(0, 2)
                .map((p) => (
                  <div key={p.id} className="flex gap-4">
                    <div className="w-1.5 bg-[--error] rounded-full shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">{p.name}</h4>
                      <p className="text-xs text-[--on-surface-variant] mt-1">
                        Progress at {p.progress}%. Needs immediate attention.
                      </p>
                      <Link href={`/projects/${p.id}`} className="mt-2 text-[--error] text-[10px] font-bold uppercase tracking-widest label-text hover:underline block">
                        Intervene Now
                      </Link>
                    </div>
                  </div>
                ))}
              {projects.filter((p) => p.status === 'on_hold' || p.progress < 30).length === 0 && (
                <p className="text-sm text-[--on-surface-variant]">All projects on track! 🎉</p>
              )}
            </div>
          </div>

          {/* Recent Milestones */}
          <div className="bg-[--surface-container-high]/40 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-6">Recent Milestones</h2>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[--outline-variant]/30">
              {[
                { icon: 'check_circle', time: 'Recently', title: 'Project Updated', desc: 'A team successfully submitted their latest progress report.' },
                { icon: 'publish', time: 'This week', title: 'New Member Joined', desc: 'A student was added to an active project.' },
                { icon: 'trophy', time: 'Ongoing', title: 'Collaboration Active', desc: 'Teams are actively collaborating on their deliverables.' },
              ].map((m, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[--primary] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                  </div>
                  <span className="label-text text-[10px] text-[--tertiary] font-bold">{m.time.toUpperCase()}</span>
                  <h4 className="text-sm font-bold mt-1">{m.title}</h4>
                  <p className="text-xs text-[--on-surface-variant]">{m.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/updates" className="w-full mt-8 py-3 bg-[--surface-container] text-[--primary] font-semibold rounded-lg hover:bg-[--surface-dim] transition-colors text-xs label-text uppercase tracking-widest flex items-center justify-center">
              Full Activity Log
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
