'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  jobTitle: string | null;
  hexa_role: string;
  hexa_department: string;
  hexa_bio: string | null;
  hexa_skills: string[];
}

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/odoo/team/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch team member');
        return res.json();
      })
      .then(setMember)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sl-silver">Loading team member...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!member) return null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Team
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          {member.name}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Role</p>
            <p className="font-medium">{member.hexa_role || member.jobTitle || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Department</p>
            <p className="font-medium capitalize">{member.hexa_department || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Email</p>
            <p className="font-medium">
              {member.email ? (
                <a href={`mailto:${member.email}`} className="text-accent hover:underline">
                  {member.email}
                </a>
              ) : '—'}
            </p>
          </div>
        </div>

        {member.hexa_bio && (
          <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-3">Bio</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">{member.hexa_bio}</p>
          </div>
        )}

        {member.hexa_skills && member.hexa_skills.length > 0 && (
          <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {member.hexa_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-sl-slate/20 text-sl-slate rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}