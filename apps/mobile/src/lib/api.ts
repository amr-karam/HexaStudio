import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const TOKEN_KEY = 'hexa_access_token';

export interface ClientMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ClientProject {
  id: number;
  name: string;
  status: string;
  type: string;
  startDate: string;
  endDate: string;
  milestones: ClientMilestone[];
}

function getApiUrl(): string {
  return Constants.expoConfig?.extra?.apiUrl ?? 'https://api.hexastudio.net';
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function fetchProjects(): Promise<ClientProject[]> {
  return apiFetch<ClientProject[]>('/api/portal/odoo/projects');
}

export function fetchMilestones(projectId: number): Promise<ClientMilestone[]> {
  return apiFetch<ClientMilestone[]>(`/api/portal/odoo/projects/${projectId}/milestones`);
}

export interface ClientInvoice {
  id: number;
  name: string;
  date: string;
  amount: number;
  residual: number;
  paymentState: string;
  state: string;
}

export function fetchInvoices(): Promise<ClientInvoice[]> {
  return apiFetch<ClientInvoice[]>('/api/portal/odoo/invoices');
}

export interface PortalDashboard {
  project: { title: string; category: string; status: string };
  timeline: Array<{ phase: string; status: string; description: string; date?: string }>;
  invoices: Array<{ id: string; amount: number; date: string; status: 'paid' | 'pending' | 'overdue' }>;
  lead: { name: string; role: string; email: string; avatar: string };
}

export function fetchPortalDashboard(): Promise<PortalDashboard> {
  return apiFetch<PortalDashboard>('/api/portal/me');
}
