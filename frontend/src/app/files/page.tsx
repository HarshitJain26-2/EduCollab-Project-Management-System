'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Upload, FileText, X, FolderOpen, Code, Database, Presentation, File } from 'lucide-react';

const CATEGORIES = ['documentation', 'code', 'dataset', 'reports', 'presentations', 'other'];
const CATEGORY_ICONS: Record<string, any> = {
    documentation: FileText, code: Code, dataset: Database, reports: FileText, presentations: File, other: FolderOpen
};
const CATEGORY_COLORS: Record<string, string> = {
    documentation: '#6c63ff', code: '#34d399', dataset: '#22d3ee', reports: '#fbbf24', presentations: '#f472b6', other: '#94a3b8'
};

export default function FilesPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [files, setFiles] = useState<Record<string, any[]>>({});
    const [selectedProject, setSelectedProject] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('documentation');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/projects').then(r => setProjects(r.data.projects || [])).catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedProject) fetchFiles();
    }, [selectedProject]);

    const fetchFiles = () => {
        setLoading(true);
        api.get(`/files?project=${selectedProject}`).then(r => setFiles(r.data.files || {})).catch(() => { }).finally(() => setLoading(false));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !selectedProject) { toast.error('Select a project and file'); return; }
        setUploading(true);
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('category', category);
        try {
            await api.post(`/files/upload?project=${selectedProject}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('File uploaded!');
            setSelectedFile(null);
            fetchFiles();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

    return (
        <DashboardLayout>
            <div className="animate-fadeIn">
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Files</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Upload and manage project files by category</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
                    {/* Upload Panel */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, fontSize: 16 }}>Upload File</h3>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="label">Project</label>
                                <select className="input" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                                    <option value="">Select project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Category</label>
                                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">File</label>
                                <div style={{ border: '2px dashed var(--border-color)', borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                    onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                    onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) setSelectedFile(file); e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                                    <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Drag & drop or click to select</p>
                                    <input type="file" id="fileInput" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                                    <label htmlFor="fileInput" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>Browse Files</label>
                                </div>
                                {selectedFile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px' }}>
                                        <FileText size={16} color="var(--accent-secondary)" />
                                        <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</span>
                                        <button type="button" onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile || !selectedProject}>
                                {uploading ? <div className="spinner" /> : <><Upload size={16} /> Upload</>}
                            </button>
                        </form>
                    </div>

                    {/* Files List */}
                    <div>
                        {!selectedProject ? (
                            <div className="empty-state card" style={{ padding: 60 }}>
                                <FolderOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                                <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Select a project to view files</p>
                            </div>
                        ) : loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
                        ) : Object.keys(files).length === 0 ? (
                            <div className="empty-state card" style={{ padding: 60 }}>
                                <FolderOpen size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 20px' }} />
                                <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No files uploaded for this project yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {CATEGORIES.filter(c => files[c]?.length).map(cat => {
                                    const Icon = CATEGORY_ICONS[cat];
                                    const color = CATEGORY_COLORS[cat];
                                    return (
                                        <div key={cat} className="card" style={{ padding: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Icon size={18} color={color} />
                                                </div>
                                                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize' }}>{cat}</h3>
                                                <span style={{ marginLeft: 'auto', background: `${color}20`, color, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{files[cat].length}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {files[cat].map((f, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                                        <FileText size={16} color={color} />
                                                        <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name.replace(/^\d+-/, '')}</span>
                                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatBytes(f.size)}</span>
                                                        <a href={`http://localhost:5000${f.path}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>View</a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
