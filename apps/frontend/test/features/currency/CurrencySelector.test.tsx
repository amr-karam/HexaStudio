import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

/* -------------------------------------------------------------------------- */
/*  Mocks                                                                     */
/* -------------------------------------------------------------------------- */

// framer-motion → strip animation-only props so DOM assertions stay clean.
// Components are cached per tag: a fresh identity on every access would make
// React remount the subtree on each render, detaching DOM nodes mid-test.
vi.mock('framer-motion', () => {
  type Passthrough = React.ComponentType<Record<string, unknown> & { children?: ReactNode }>;
  const cache = new Map<string, Passthrough>();
  const passthrough = (Tag: string): Passthrough =>
    ({ children, ...props }: Record<string, unknown>) => {
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        whileHover: _wh,
        whileTap: _wt,
        whileInView: _wv,
        viewport: _vp,
        variants: _v,
        style: _s,
        ...rest
      } = props;
      const Component = Tag as unknown as Passthrough;
      return <Component {...rest}>{children as ReactNode}</Component>;
    };
  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          if (!cache.has(tag)) cache.set(tag, passthrough(tag));
          return cache.get(tag);
        },
      },
    ),
  };
});

// LocaleProvider → deterministic English locale, identity translator.
vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (_path: string) => '',
    locale: 'en',
    dir: 'ltr' as const,
  }),
}));

import { CurrencySelector } from '@/features/currency/CurrencySelector';
import { useCurrencyStore, type CurrencyOption } from '@/features/currency/currency-store';
import { currencyApi } from '@/features/currency/api';

const SAMPLE: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', region: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', region: 'FR' },
  { code: 'GBP', symbol: '£', name: 'British Pound', region: 'GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', region: 'JP' },
];

/** Reset the Zustand store to a known, non-loading state before each test. */
function seedStore(overrides?: Partial<{
  selectedCurrency: string | null;
  availableCurrencies: CurrencyOption[];
  isLoading: boolean;
}>): void {
  useCurrencyStore.setState({
    selectedCurrency: overrides?.selectedCurrency ?? null,
    availableCurrencies: overrides?.availableCurrencies ?? SAMPLE,
    isLoading: overrides?.isLoading ?? false,
    isHydrated: true,
  });
}

beforeEach(() => {
  // Prevent the GeoIP auto-detect effect from hitting the network.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
  );
  seedStore();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe('CurrencySelector', () => {
  it('renders the trigger with the active currency', () => {
    seedStore({ selectedCurrency: 'EUR' });
    render(<CurrencySelector />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('EUR');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the listbox and renders the available currencies', async () => {
    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(SAMPLE.length);
    expect(screen.getByText('US Dollar', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Euro', { exact: false })).toBeInTheDocument();
  });

  it('updates the store when a currency is selected', async () => {
    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));
    const gbpOption = await screen.findByRole('option', { name: /British Pound/i });
    await user.click(gbpOption);

    expect(useCurrencyStore.getState().selectedCurrency).toBe('GBP');
  });

  it('highlights the active currency with aria-selected', async () => {
    seedStore({ selectedCurrency: 'JPY' });
    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));
    const jpyOption = await screen.findByRole('option', { name: /Japanese Yen/i });
    expect(jpyOption).toHaveAttribute('aria-selected', 'true');
  });

  it('resets to auto-detect when the Auto option is chosen', async () => {
    seedStore({ selectedCurrency: 'EUR' });
    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));
    const autoButton = await screen.findByRole('button', { name: /auto/i });
    await user.click(autoButton);

    expect(useCurrencyStore.getState().selectedCurrency).toBeNull();
  });

  it('filters the list via the search box', async () => {
    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'eur');

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });
    expect(screen.getByText('Euro', { exact: false })).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<CurrencySelector />);

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    expect(await screen.findByRole('searchbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(trigger).toHaveFocus();
  });
});

describe('CurrencySelector — fallback list', () => {
  it('renders the hardcoded common currencies when the API fails', async () => {
    // Simulate the CurrencyProvider fallback: API rejects, store keeps a
    // small hardcoded common set (USD/EUR/GBP/JPY/AED).
    vi.spyOn(currencyApi, 'listCurrencies').mockRejectedValue(
      new Error('network down'),
    );
    const fallback: CurrencyOption[] = [
      { code: 'USD', symbol: '$', name: 'US Dollar', region: 'US' },
      { code: 'EUR', symbol: '€', name: 'Euro', region: 'FR' },
      { code: 'GBP', symbol: '£', name: 'British Pound', region: 'GB' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen', region: 'JP' },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', region: 'AE' },
    ];
    seedStore({ availableCurrencies: fallback });

    const user = userEvent.setup();
    render(<CurrencySelector />);

    await user.click(screen.getByRole('combobox'));
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(fallback.length);
    expect(screen.getByText('UAE Dirham', { exact: false })).toBeInTheDocument();
  });
});
