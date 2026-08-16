import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { setCachedData, getCachedData, DEFAULT_TTL } from './cache';

const TOKEN_KEY = 'hexa_access_token';
const REFRESH_KEY = 'hexa_refresh_token';

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

export interface ClientProjectDetail {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  description?: string;
  team: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
  }>;
  milestones: ClientMilestone[];
  budgetSummary?: {
    total: number;
    invoiced: number;
    remaining: number;
  };
}

function getApiUrl(): string {
  return Constants.expoConfig?.extra?.apiUrl ?? 'https://api.hexastudio.net';
}

/**
 * Guards against redirect storms: when several requests 401 at once (e.g. a
 * batch refresh), only the first one triggers navigation to the login screen.
 */
let isRedirectingToLogin = false;

async function handleUnauthorized(): Promise<void> {
  // Clear stale credentials so no further request reuses the dead token.
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);

  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  router.replace('/login');
  // Allow future 401 bursts (after the user returns) to redirect again.
  setTimeout(() => {
    isRedirectingToLogin = false;
  }, 1000);
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

  if (response.status === 401) {
    // No token-refresh flow exists in this client yet — drop the session and
    // prompt the user to sign in again.
    await handleUnauthorized();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function withCache<T>(
  cacheKey: string,
  ttlMinutes: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const data = await fetcher();
    await setCachedData(cacheKey, data, ttlMinutes);
    return data;
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && /network/i.test(error.message))) {
      const cached = await getCachedData<T>(cacheKey);
      if (cached !== null) return cached;
    }
    throw error;
  }
}

export function fetchProjects(): Promise<ClientProject[]> {
  return withCache('cache:projects', DEFAULT_TTL.projects, () =>
    apiFetch<ClientProject[]>('/api/portal/odoo/projects'),
  );
}

export function fetchProjectDetail(projectId: number): Promise<ClientProjectDetail> {
  return withCache(`cache:project-detail:${projectId}`, DEFAULT_TTL.project, () =>
    apiFetch<ClientProjectDetail>(`/api/portal/projects/${projectId}/detail`),
  );
}

export function fetchMilestones(projectId: number): Promise<ClientMilestone[]> {
  return withCache(`cache:project:${projectId}`, DEFAULT_TTL.project, () =>
    apiFetch<ClientMilestone[]>(`/api/portal/odoo/projects/${projectId}/milestones`),
  );
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
  return withCache('cache:invoices', DEFAULT_TTL.invoices, () =>
    apiFetch<ClientInvoice[]>('/api/portal/odoo/invoices'),
  );
}

export interface PortalDashboard {
  project: { title: string; category: string; status: string };
  timeline: Array<{ phase: string; status: string; description: string; date?: string }>;
  invoices: Array<{ id: string; amount: number; date: string; status: 'paid' | 'pending' | 'overdue' }>;
  lead: { name: string; role: string; email: string; avatar: string };
}

export function fetchPortalDashboard(): Promise<PortalDashboard> {
  return withCache('cache:dashboard', DEFAULT_TTL.dashboard, () =>
    apiFetch<PortalDashboard>('/api/portal/me'),
  );
}
