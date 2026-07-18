import { API_BASE_URL } from '@/config/constants';

export interface CurrencyConfig {
  currency: string;
  region: string;
  taxRate: number;
  priceMultiplier: number;
  minimumPrice: number;
  includesTax: boolean;
  label?: string;
}

export interface RateResponse {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

export interface PricingResponse {
  baseAmount: number;
  currency: string;
  taxRate: number;
  priceMultiplier: number;
  finalAmount: number;
  tax: number;
  subtotal: number;
  includesTax: boolean;
}

export interface CalculatePriceRequest {
  baseAmount: number;
  baseCurrency: string;
  targetCurrency: string;
  region?: string;
  includesTax?: boolean;
}

export interface PreviewPriceParams {
  baseAmount: number;
  baseCurrency: string;
  region: string;
}

const BASE = `${API_BASE_URL}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Currency API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const currencyApi = {
  listCurrencies: () => request<CurrencyConfig[]>('/currency/list'),
  getCurrency: (code: string) =>
    request<CurrencyConfig | { error: string }>(`/currency/${code}`),
  getRate: (from: string, to: string) =>
    request<RateResponse>(`/currency/rates?from=${from}&to=${to}`),
  calculatePrice: (req: CalculatePriceRequest) =>
    request<PricingResponse>('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(req),
    }),
  previewPrice: (params: PreviewPriceParams) =>
    request<PricingResponse>(
      `/pricing/preview?baseAmount=${params.baseAmount}&baseCurrency=${params.baseCurrency}&region=${params.region}`
    ),
};
