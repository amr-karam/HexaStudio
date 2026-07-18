'use client';

import { useRegionalPrice } from './usePricing';

interface CurrencyBadgeProps {
  baseAmountUSD: number;
  className?: string;
}

export function CurrencyBadge({ baseAmountUSD, className }: CurrencyBadgeProps) {
  const { formatted, loading, currency, includesTax, taxRate, region } =
    useRegionalPrice(baseAmountUSD);

  const taxNote = includesTax
    ? `incl. tax (${region})`
    : `excl. tax (${region})`;
  const title = includesTax
    ? `Price in ${currency}, including tax at ${(taxRate * 100).toFixed(0)}%`
    : `Price in ${currency}, excluding tax`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-white/5 px-3 py-1 text-xs text-white/60 ${
        className ?? ''
      }`}
      title={loading ? `Region ${region}` : title}
      aria-label={`${formatted}, ${taxNote}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"
      />
      <span className="font-medium text-white/90">{formatted}</span>
      <span className="text-[10px] uppercase tracking-wide text-[#D4AF37]/80">
        {loading ? region : taxNote}
      </span>
    </span>
  );
}
