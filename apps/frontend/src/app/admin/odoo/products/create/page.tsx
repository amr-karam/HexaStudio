'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormData {
  name: string;
  default_code: string;
  list_price: string;
  type: string;
}

export default function ProductCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    default_code: '',
    list_price: '',
    type: 'product',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) {
      return 'Product name is required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/odoo/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const data = await response.json();
      router.push(`/admin/odoo/products/${data.product?.id || data.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/odoo/products');
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <button
          onClick={handleCancel}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Products
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          Add New Product
        </h1>

        {submitError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="name">
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="default_code">
                  SKU
                </label>
                <input
                  type="text"
                  id="default_code"
                  name="default_code"
                  value={formData.default_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g. PRD-001"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="list_price">
                    Price
                  </label>
                  <input
                    type="number"
                    id="list_price"
                    name="list_price"
                    value={formData.list_price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sl-silver border border-sl-glass-border rounded-lg hover:bg-sl-glass-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
