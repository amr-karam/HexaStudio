'use client';

import { cn } from '@/lib/utils';
import { useRegionalPrice } from './usePricing';
import { useCurrencyStore } from './currency-store';

interface CurrencyBadgeProps {
  baseAmountUSD: number;
  className?: string;
}

export function CurrencyBadge({ baseAmountUSD, className }: CurrencyBadgeProps) {
  const { formatted, loading, currency, includesTax, taxRate, region } =
    useRegionalPrice(baseAmountUSD);

  const selectedCurrency = useCurrencyStore((s) => s.selectedCurrency);
  const isOverridden = selectedCurrency !== null;

  const taxNote = includesTax
    ? `incl. tax (${region})`
    : `excl. tax (${region})`;

  const title = includesTax
    ? `Price in ${currency}, including tax at ${(taxRate * 100).toFixed(0)}%`
    : `Price in ${currency}, excluding tax`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-white/5 px-3 py-1 text-xs text-white/60',
        className,
      )}
      title={loading ? `Region ${region}` : title}
      aria-label={`${formatted}, ${taxNote}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors duration-300',
          isOverridden ? 'bg-accent-light' : 'bg-accent',
        )}
      />
      <span className="font-medium text-white/90">{formatted}</span>
      <span className="text-[10px] uppercase tracking-wide text-accent/80">
        {loading ? region : taxNote}
      </span>
    </span>
  );
}
