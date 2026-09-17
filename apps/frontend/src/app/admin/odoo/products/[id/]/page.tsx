'use client';

import { useState, useEffect } from 'react';
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

export default function ProductDetailPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/odoo/products/123')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProduct(data.product ?? data);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <p className="text-sl-silver">Loading product...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-semibold" role="alert">
            Failed to load product
          </p>
          <p className="text-sm text-destructive mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/odoo/products')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-semibold" role="alert">
            Product not found
          </p>
          <button
            onClick={() => router.push('/admin/odoo/products')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-accent">{product.name}</h1>
          <p className="text-xs text-sl-silver uppercase tracking-widest">Product detail</p>
        </div>
        <button
          onClick={() => router.push('/admin/odoo/products')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Back to Products
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
          <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Product Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-sl-silver mb-1">Name</p>
              <p className="text-white font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-xs text-sl-silver mb-1">SKU</p>
              <p className="text-white font-medium">{product.default_code || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-sl-silver mb-1">Price</p>
              <p className="text-white font-medium">${product.list_price?.toFixed(2) || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-sl-silver mb-1">Type</p>
              <p className="text-white font-medium capitalize">{product.type || '—'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
          <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-sl-silver mb-1">Status</p>
              <p className={`font-medium capitalize ${product.is_active ? 'text-green-400' : 'text-red-400'}`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-xs text-sl-silver mb-1">Category ID</p>
              <p className="text-white font-medium">{product.categ_id ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
