'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  is_active: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/odoo/customers')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch customers: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.customers ?? data.result ?? []);
        setCustomers(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = searchQuery
    ? customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : customers;

  return (
    <main className="flex-1 flex flex-col p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Failed to load customers</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-accent">Customers</h1>
          <p className="text-xs text-sl-silver uppercase tracking-widest">Partners and clients</p>
        </div>
        <button
          onClick={() => router.push('/admin/odoo/customers/create')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Add Customer
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          className="w-full pl-10 pr-4 py-2 bg-sl-glass-bg border border-sl-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-silver"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.05-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sl-silver mb-4">No customers found</p>
          <p className="text-sm text-sl-silver/70 mb-6">There are no customers in the system yet.</p>
          <button
            onClick={() => router.push('/admin/odoo/customers/create')}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Add First Customer
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                <th className="font-medium w-48">Customer</th>
                <th className="text-center w-32">Email</th>
                <th className="text-center w-32">Phone</th>
                <th className="text-center w-40">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                  <td className="font-medium">
                    <a href={`/admin/odoo/customers/${customer.id}`} className="text-accent hover:underline">
                      {customer.name}
                    </a>
                  </td>
                  <td className="text-sl-silver text-sm text-center">
                    {customer.email || '—'}
                  </td>
                  <td className="text-sl-silver text-sm text-center">
                    {customer.phone || '—'}
                  </td>
                  <td className="text-center text-sl-silver capitalize">
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
