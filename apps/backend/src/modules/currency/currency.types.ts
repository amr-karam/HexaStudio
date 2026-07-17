/**
 * Currency & Pricing Types
 * Handles multi-currency support, exchange rates, regional pricing, and tax compliance
 */

export interface CurrencyConfig {
  code: string; // ISO 4217 (USD, EUR, GBP, JPY, etc.)
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export interface RegionalPricingRule {
  region: string; // ISO 3166-1 alpha-2 (US, GB, FR, JP, AE, MX, etc.)
  currency: string; // ISO 4217
  taxRate: number; // 0.0 - 1.0 (VAT/GST/Sales tax)
  priceMultiplier: number; // Regional markup/discount
  minimumPrice: number;
  includesTax: boolean;
}

export interface ExchangeRate {
  from: string; // ISO 4217
  to: string; // ISO 4217
  rate: number;
  lastUpdated: Date;
  source: string; // 'ecb', 'openexchangerates', 'fixer', etc.
}

export interface PricingRequest {
  baseAmount: number; // In base currency (USD)
  baseCurrency: string; // ISO 4217
  targetCurrency: string; // ISO 4217
  region?: string; // ISO 3166-1 alpha-2
  includesTax?: boolean;
}

export interface PricingResponse {
  baseCurrency: string;
  baseAmount: number;
  targetCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
  region?: string;
  taxRate: number;
  priceMultiplier: number;
  finalAmount: number; // After tax and regional adjustments
  includesTax: boolean;
  breakdown: {
    subtotal: number;
    tax: number;
    discount?: number;
  };
  timestamp: Date;
}

export interface CurrencyPreference {
  userId: string;
  preferredCurrency: string;
  preferredRegion: string;
  autoDetect: boolean;
}
