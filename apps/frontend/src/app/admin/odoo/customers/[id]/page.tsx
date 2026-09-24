/**
 * Customers/Partners detail page
 * Dynamic segment: /admin/odoo/customers/[id]
 * Uses Next.js useParams pattern for consistency
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  website: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolved = use(params);
  const id = resolved.id;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Customer ID required');
      setLoading(false);
      return;
    }

    fetch(`/api/odoo/customers/${id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Customer not found');
          }
          throw new Error(`Failed to fetch customer: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const cust = data.customer ?? data.result ?? data;
        setCustomer(cust);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCountry = (code: string | null): string | null => {
    if (!code) return null;
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' }).of(code as unknown as string) ?? null;
    } catch {
      return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center animate-spin"
            role="status"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M12 15v-4l-1 1" />
            </svg>
          </div>
          <p className="text-sl-silver">Loading customer...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-destructive">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="9" />
              <line x1="12" y1="15" x2="12" y2="15" />
            </svg>
          </div>
          <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">
            {error === 'Customer ID required' ? 'Customer ID Required' : 'Error'}
          </h1>
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/odoo/customers')}
            className="text-accent hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!customer) {
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
          <p className="text-sl-silver">Customer not found</p>
          <button
            onClick={() => router.push('/admin/odoo/customers')}
            className="mt-4 text-accent hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.push('/admin/odoo/customers')}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to customers list
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight">
            {customer.name}
          </h1>
          <button
            onClick={() => router.push(`/admin/odoo/customers/${customer.id}/edit`)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Edit Customer
          </button>
        </div>

        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">
          Customer detail — partner information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Email</p>
            <p className="font-medium">{customer.email || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Phone</p>
            <p className="font-medium">{customer.phone || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Company</p>
            <p className="font-medium">{customer.company_name || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Status</p>
            <p className={`font-medium ${customer.is_active ? 'text-success-ink' : 'text-sl-silver'}`}>
              {customer.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg mb-6">
          <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Address</p>
          <p className="font-medium">{customer.street}</p>
          {customer.city && <p className="font-medium mb-1">{customer.city}</p>}
          {customer.state && <p className="font-medium mb-1">{customer.state}</p>}
          {customer.zip_code && <p className="font-medium mb-1">{customer.zip_code}</p>}
          {customer.country && (
            <p className="text-sm text-sl-silver mt-1">{formatCountry(customer.country)}</p>
          )}
        </div>

        {customer.website && (
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg mb-6">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Website</p>
            <a
              href={customer.website}
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {customer.website}
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {customer.created_at && (
            <div>
              <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">
                Created
              </p>
              <p className="font-medium">
                {formatDate(customer.created_at)}
              </p>
            </div>
          )}
          {customer.updated_at && (
            <div>
              <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">
                Last Updated
              </p>
              <p className="font-medium">
                {formatDate(customer.updated_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
