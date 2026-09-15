'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface LeadDetail {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  hexa_source: string;
  probability: number;
  state: string;
  expected_closing_date: string | null;
  notes: string | null;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/odoo/crm/leads/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch lead');
        return res.json();
      })
      .then(setLead)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sl-silver">Loading lead...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!lead) return null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Leads
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          {lead.name}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Email</p>
            <p className="font-medium">{lead.email || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Phone</p>
            <p className="font-medium">{lead.phone || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Source</p>
            <p className="text-accent font-medium capitalize">{lead.hexa_source}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Probability</p>
            <p className="text-2xl font-bold">{lead.probability}%</p>
          </div>
        </div>

        {lead.expected_closing_date && (
          <div className="mt-4 text-center text-sl-silver">
            <span className="text-sm">Expected close: {new Date(lead.expected_closing_date).toLocaleDateString()}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
          <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-3">State</h2>
          <p className="text-accent font-medium capitalize">{lead.state}</p>
        </div>

        {lead.notes && (
          <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-3">Notes</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>
    </main>
  );
}