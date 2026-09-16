'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  street: string;
  city: string;
  zip_code: string;
  country: string;
  website: string;
}

export default function CustomerCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    street: '',
    city: '',
    zip_code: '',
    country: '',
    website: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const validate = (): string | null => {
  if (!formData.name.trim()) {
    return 'Customer name is required';
  }
  
  // Explicit email validation
  if (formData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
  }
  
  if (!formData.email && !formData.phone) {
    return 'Either email or phone number is required';
  }
  
  return null;
};

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      const response = await fetch('/api/odoo/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const data = await response.json();
      router.push(`/admin/odoo/customers/${data.customer?.id || data.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/odoo/customers');
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <button
          onClick={handleCancel}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Customers
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          Add New Customer
        </h1>

        {submitError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information Section */}
          <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Customer Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="name">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="company_name">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Company name"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Address</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="street">
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="city">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="zip_code">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="country">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="p-6 bg-sl-glass-bg border border-sl-glass-border rounded-lg">
            <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-4">Contact Details & Website</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sl-silver mb-1" htmlFor="website">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-sl-void border border-sl-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              disabled={loading}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}