'use client';

import { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { useToast } from '@/context/ToastContext';

interface ProjectsTabProps {
    apiUrl: string;
}

export default function ProjectsTab({ apiUrl }: ProjectsTabProps) {
    const { showToast } = useToast();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: '',
        status: 'Planning',
        location: ''
    });

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/projects`);
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                code: `PRJ-${Date.now()}`, // Auto-generate code
                description: `${formData.description} | Location: ${formData.location}`, // Append location
                start_date: new Date().toISOString().split('T')[0], // Today's date
                total_budget: parseFloat(formData.budget),
                donor_name: "Self-Funded" // Default
            };

            const res = await fetch(`${apiUrl}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', description: '', budget: '', status: 'Planning', location: '' });
                fetchProjects();
                showToast(`Project "${formData.name}" created successfully!`, 'success');
            } else {
                showToast('Failed to create project. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            showToast('An error occurred while creating the project.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Projects</h2>
                    <p className="text-neutral-400 mt-1">Manage and track your initiatives</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    <Icons.Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g., Community Water Well"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Budget (USD)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    className="glass-input"
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Location</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="glass-input"
                                    placeholder="City, Country"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="glass-select"
                                >
                                    <option value="Planning" className="bg-neutral-900">Planning</option>
                                    <option value="Active" className="bg-neutral-900">Active</option>
                                    <option value="Completed" className="bg-neutral-900">Completed</option>
                                    <option value="On Hold" className="bg-neutral-900">On Hold</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="glass-input min-h-[100px]"
                                placeholder="Describe the project goals and scope..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                    <p className="text-neutral-400 mt-4">Loading projects...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="glass-card p-6 hover:border-sky-500/50 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.ArrowUpRight className="w-5 h-5 text-sky-500" />
                            </div>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                                    project.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    <Icons.Briefcase className="w-6 h-6" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${project.status === 'Active' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                                    project.status === 'Completed' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                                        'bg-amber-500/5 border-amber-500/20 text-amber-400'
                                    }`}>
                                    {project.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Budget</p>
                                    <p className="text-white font-mono">${project.budget?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 mb-1">Location</p>
                                    <p className="text-white truncate">{project.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 glass-panel rounded-xl border-dashed">
                            <Icons.Briefcase className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">No projects yet</h3>
                            <p className="text-neutral-400 mt-2">Create your first project to get started</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
