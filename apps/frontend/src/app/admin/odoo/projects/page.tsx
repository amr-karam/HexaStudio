'use client';

import { useState, useEffect } from 'react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface ProjectData {
    id: number;
    name: string;
    hexa_deliverables_count: number;
    hexa_last_deliverable_at: string | null;
    hexa_public_strapi_id: string | null;
    hexa_team_member_ids: number[];
  }

  useEffect(() => {
    fetch('/api/odoo/projects')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sl-silver">Loading projects...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">Odoo Projects</h1>
        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">Project board with stages, tasks & real-time uploads</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                <th className="font-medium w-64">Project</th>
                <th className="text-center w-32">Deliverables</th>
                <th className="text-center w-40">Last Upload</th>
                <th className="text-center w-48">Strapi ID</th>
                <th className="text-center w-56">Team Members</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                  <td className="font-medium">
                    <a href={`/admin/odoo/projects/${project.id}`} className="text-accent hover:underline">
                      {project.name}
                    </a>
                  </td>
                  <td className="text-center">
                    <span className="text-accent font-medium">{project.hexa_deliverables_count}</span>
                  </td>
                  <td className="text-center text-sl-silver capitalize">
                    {project.hexa_last_deliverable_at ? 
                      new Date(project.hexa_last_deliverable_at).toLocaleDateString() : 
                      '—'}
                  </td>
                  <td className="text-center text-sl-silver capitalize">
                    {project.hexa_public_strapi_id || '—'}
                  </td>
                  <td className="text-center">
                    {project.hexa_team_member_ids.length > 0
                      ? project.hexa_team_member_ids.length
                      : '<span className="text-sl-silver">—</span>'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}