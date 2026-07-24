import { captureException } from '@sentry/nextjs';
import type { FAQ, Service } from '@hexastudio/types';
import { API_BASE_URL } from '@/config/constants';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export interface ContactPageData {
  services: Service[];
  faqs: FAQ[];
}

export async function fetchContactPageData(): Promise<ContactPageData> {
  const baseUrl = process.env.API_URL || 'http://backend:4000';

  const [servicesRes, faqsRes] = await Promise.allSettled([
    fetchWithTimeout(`${baseUrl}/api/services`, { next: { revalidate: 3600 } }),
    fetchWithTimeout(`${baseUrl}/api/faqs`, { next: { revalidate: 3600 } }),
  ]);

  let services: Service[] = [];
  if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
    try {
      const data = await servicesRes.value.json();
      services = data.services ?? [];
    } catch { /* empty */ }
  } else if (servicesRes.status === 'rejected') {
    captureException(servicesRes.reason);
  }

  let faqs: FAQ[] = [];
  if (faqsRes.status === 'fulfilled' && faqsRes.value.ok) {
    try {
      const data = await faqsRes.value.json();
      faqs = data.faqs ?? [];
    } catch { /* empty */ }
  } else if (faqsRes.status === 'rejected') {
    captureException(faqsRes.reason);
  }

  return { services, faqs };
}
