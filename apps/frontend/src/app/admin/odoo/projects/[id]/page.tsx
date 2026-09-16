'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';


interface ProjectDetail {
  id: number;
  name: string;
  hexa_deliverables_count: number;
  hexa_last_deliverable_at: string | null;
  hexa_public_strapi_id: string | null;
  hexa_team_member_ids: number[];
  hexa_notes: string | null;
  hexa_budget_total: number | null;
  hexa_currency: string | null;
  stage: string;
  tasks: Task[];
}

interface Task {
  id: number;
  name: string;
  stage: string;
  user_id: number | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/odoo/projects/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch project');
        return res.json();
      })
      .then(data => setProject(data.project ?? data.result ?? data))
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sl-silver">Loading project...</p>;
  if (error) return <p className="text-destructive">Error: {error}</p>;
  if (!project) return null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Projects
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          {project.name}
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
            <p className="text-xs text-sl-silver uppercase tracking-widest">Deliverables Count</p>
            <p className="text-2xl font-bold text-accent">{project.hexa_deliverables_count}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
            <p className="text-xs text-sl-silver uppercase tracking-widest">Stage</p>
            <p className="text-2xl font-bold capitalize">{project.stage}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
            <p className="text-xs text-sl-silver uppercase tracking-widest">Last Deliverable</p>
            <p className="text-sm text-foreground">
              {project.hexa_last_deliverable_at ?
                new Date(project.hexa_last_deliverable_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
                'No deliverables yet'}
            </p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
            <p className="text-xs text-sl-silver uppercase tracking-widest">Team Members</p>
            <p className="text-sm text-foreground">
              {project.hexa_team_member_ids.length} member{project.hexa_team_member_ids.length !== 1 ? 's' : ''}
            </p>
          </div>
          {project.hexa_public_strapi_id && (
            <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
              <p className="text-xs text-sl-silver uppercase tracking-widest">Strapi ID</p>
              <p className="text-sm text-foreground">{project.hexa_public_strapi_id}</p>
            </div>
          )}
        </div>

        {project.hexa_notes && (
          <div className="mb-8 p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-2">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{project.hexa_notes}</p>
          </div>
        )}

        {project.tasks && project.tasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-accent mb-4">Tasks</h2>
            <div className="space-y-3">
              {project.tasks.map(task => (
                <div key={task.id} className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-sm text-sl-silver">
                      {task.user_id ? `Assignee: #${task.user_id}` : 'Unassigned'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-sl-slate/20 text-sl-slate rounded capitalize">
                    {task.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}