/**
 * Products detail page
 * Dynamic segment: /admin/odoo/products/[id]
 * Uses Next.js useParams pattern for consistency
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  default_code: string | null;
  list_price: number;
  type: string;
  categ_id: number | null;
  is_active: boolean;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolved = use(params);
  const id = resolved.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Product ID required');
      setLoading(false);
      return;
    }

    fetch(`/api/odoo/products/${id}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error(`Failed to fetch product: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const prod = data.product ?? data.result ?? data;
        setProduct(prod);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [id]);

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
          <p className="text-sl-silver">Loading product...</p>
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
            {error === 'Product ID required' ? 'Product ID Required' : 'Error'}
          </h1>
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/odoo/products')}
            className="text-accent hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sl-silver">Product not found</p>
          <button
            onClick={() => router.push('/admin/odoo/products')}
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
          onClick={() => router.push('/admin/odoo/products')}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to products list
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight">
            {product.name}
          </h1>
          <button
            onClick={() => router.push(`/admin/odoo/products/${product.id}/edit`)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Edit Product
          </button>
        </div>

        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">
          Product detail — catalog information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">SKU</p>
            <p className="font-medium">{product.default_code || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Price</p>
            <p className="font-medium">${product.list_price?.toFixed(2) || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Type</p>
            <p className="font-medium capitalize">{product.type || '—'}</p>
          </div>
          <div className="p-4 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <p className="text-xs text-sl-silver uppercase tracking-wider mb-1">Status</p>
            <p className={`font-medium ${product.is_active ? 'text-success-ink' : 'text-sl-silver'}`}>
              {product.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
