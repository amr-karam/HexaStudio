import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CustomerDetailPage from '@/app/admin/odoo/customers/[id]/page';

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
  }),
  useParams: () => ({ id: '123' }),
}));

describe('CustomerDetailPage', () => {
  const mockCustomer = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company_name: 'Acme Corp',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105',
    country: 'US',
    website: 'https://acme.com',
    is_active: true,
    avatar_url: null,
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-06-20T14:45:00Z',
    is_company: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders customer name', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('renders customer email', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();
  });

  it('renders customer phone', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('+1 (555) 123-4567')).toBeInTheDocument();
  });

  it('renders company name', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders address details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
    expect(screen.getByText('94105')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('renders website as link', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    const websiteLink = await screen.findByRole('link', {
      name: 'https://acme.com',
    });
    expect(websiteLink).toHaveAttribute('href', 'https://acme.com');
  });

  it('renders status badge', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('Active')).toBeInTheDocument();
  });

  it('renders created and updated dates', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText(/Created/)).toBeInTheDocument();
    expect(await screen.findByText(/Last Updated/)).toBeInTheDocument();
  });

  it('handles loading state', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(() => {
      return new Promise(() => { /* pending forever */ });
    });

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('Customer not found')).toBeInTheDocument();
    expect(screen.getByText(/Go Back/)).toBeInTheDocument();
  });

  it('renders edit button', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customer: mockCustomer }),
    } as Response);

    render(<CustomerDetailPage params={{ id: '123' }} />);
    expect(await screen.findByText('Edit Customer')).toBeInTheDocument();
  });
});