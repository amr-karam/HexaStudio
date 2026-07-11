import { API_BASE_URL } from '@/config/constants';
import { fetchJson } from '@/lib/api';

export interface PortalProjectStatus {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  date?: string;
}

export interface PortalDocument {
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface PortalInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ProjectRequest {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'completed';
  createdAt: string;
}

export interface PortalData {
  project: {
    title: string;
    category: string;
    status: string;
  };
  timeline: PortalProjectStatus[];
  documents: PortalDocument[];
  invoices: PortalInvoice[];
  lead: {
    name: string;
    role: string;
    email: string;
    avatar: string;
  };
}

export const portalService = {
  getDemoData(): Promise<PortalData> {
    return fetchJson<PortalData>(`${API_BASE_URL}/portal/demo`, undefined, 'Failed to fetch portal data');
  },

  sendRequest(requestData: Partial<ProjectRequest>): Promise<ProjectRequest> {
    return fetchJson<ProjectRequest>(
      `${API_BASE_URL}/requests`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      },
      'Failed to send request',
    );
  },

  getClientRequests(clientId: string): Promise<ProjectRequest[]> {
    return fetchJson<ProjectRequest[]>(
      `${API_BASE_URL}/requests/client/${clientId}`,
      undefined,
      'Failed to fetch requests',
    );
  },
};
