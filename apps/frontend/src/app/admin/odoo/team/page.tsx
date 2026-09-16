'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface Employee {
    id: number;
    name: string;
    email: string | null;
    jobTitle: string | null;
    hexa_role: string;
    hexa_department: string;
  }

  useEffect(() => {
    fetch('/api/odoo/team')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch team members');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.members ?? data.employees ?? data.result ?? []);
        setEmployees(Array.isArray(list) ? list : []);
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
        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">Team Members</h1>
        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">Employee directory with roles & departments</p>

        {loading ? (
          <p className="text-sl-silver">Loading team members...</p>
        ) : error ? (
          <p className="text-destructive">Error: {error}</p>
        ) : employees.length === 0 ? (
          <p className="text-sl-silver text-center py-12">No team members found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                  <th className="font-medium w-48">Name</th>
                  <th className="text-center w-40">Role</th>
                  <th className="text-center w-40">Department</th>
                  <th className="text-center w-32">Email</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                    <td className="font-medium">
                      <a href={`/admin/odoo/team/members/${employee.id}`} className="text-accent hover:underline">
                        {employee.name}
                      </a>
                    </td>
                    <td className="text-center text-sl-silver text-sm">
                      {employee.hexa_role || employee.jobTitle || '—'}
                    </td>
                    <td className="text-center text-sl-silver capitalize text-sm">
                      {employee.hexa_department || '—'}
                    </td>
                    <td className="text-center text-sl-silver text-sm">
                      <a href={`mailto:${employee.email}`} className="hover:text-accent">
                        {employee.email || '—'}
                      </a>
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