'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/ui/AppLayout';
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
  githubLink?: string;
  driveLinks?: { title: string; url: string }[];
  members?: { id: string; name: string; avatar?: string }[];
}

export default function ProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
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
    if (token) fetchProjects();
  }, [token]);

  const statusColors: Record<string, string> = {
    planning: 'bg-slate-100 text-slate-600',
    active: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-red-100 text-red-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[--primary] mb-1">Projects</h1>
        <p className="text-[--on-surface-variant]">Overview of all collaborative research and academic projects.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-64 shadow-sm border border-slate-100" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">folder_open</span>
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-[--on-surface-variant]">You are not currently part of any projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-[--outline-variant]/10 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`label-text text-[10px] uppercase font-bold px-2 py-1 rounded-full ${statusColors[p.status] ?? 'bg-slate-100'}`}>
                    {p.status}
                  </span>
                  <div className="flex gap-2">
                    {p.githubLink && (
                      <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                      </a>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{p.name}</h3>
                <p className="text-sm text-[--on-surface-variant] line-clamp-2 mb-6">{p.description}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs label-text font-bold">
                    <span className="text-[--on-surface-variant]">Progress</span>
                    <span className="text-[--primary]">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[--surface-variant] rounded-full overflow-hidden">
                    <div className="h-full bg-[--primary] rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {p.members?.slice(0, 3).map((m) => (
                      <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden shadow-sm">
                        {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : m.name[0].toUpperCase()}
                      </div>
                    ))}
                    {(p.members?.length ?? 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                        +{p.members!.length - 3}
                      </div>
                    )}
                  </div>
                  <Link href={`/dashboard`} className="label-text text-xs font-bold text-[--primary] hover:underline uppercase tracking-widest">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
