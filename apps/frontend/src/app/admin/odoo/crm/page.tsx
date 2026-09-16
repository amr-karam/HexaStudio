'use client';

import { useState, useEffect } from 'react';

export default function CrmPage() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface LeadData {
    id: number;
    name: string;
    email: string | null;
    hexa_source: string;
    probability: number;
    state: string;
  }

  useEffect(() => {
    fetch('/api/odoo/crm/leads')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch CRM leads');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.leads ?? data.result ?? []);
        setLeads(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">CRM Leads</h1>
        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">Lead pipeline — qualification, source, probability</p>

        {loading ? (
          <p className="text-sl-silver">Loading CRM leads...</p>
        ) : error ? (
          <p className="text-destructive">Error: {error}</p>
        ) : leads.length === 0 ? (
          <p className="text-sl-silver text-center py-12">No leads found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                  <th className="font-medium w-48">Lead Name</th>
                  <th className="text-center w-32">Email</th>
                  <th className="text-center w-32 hexa-source">Source</th>
                  <th className="text-center w-32">Probability</th>
                  <th className="text-center w-40">State</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                    <td className="font-medium">
                      <a href={`/admin/odoo/crm/leads/${lead.id}`} className="text-accent hover:underline">
                        {lead.name}
                      </a>
                    </td>
                    <td className="text-sl-silver text-sm">
                      {lead.email || '—'}
                    </td>
                    <td className="text-center">
                      <span className="px-2 py-1 text-xs rounded capitalize">
                        {lead.hexa_source}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-accent font-medium">{lead.probability}%</span>
                    </td>
                    <td className="text-center text-sl-silver capitalize">
                      {lead.state}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}