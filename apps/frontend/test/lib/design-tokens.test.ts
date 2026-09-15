import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SETTINGS,
  fetchDesignSettings,
  injectDesignTokens,
  publishDesignSettings,
} from '@/lib/design-tokens';

const CMS_URL = 'https://cms.test';

const cmsFields = {
  colors: {
    gold: '#B8912F',
    void: '#000000',
    obsidian: '#111113',
    alabaster: '#FFFFFF',
    muted: '#999999',
    goldSubtle: 'rgba(184,145,47,0.15)',
  },
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Roboto',
    monoFont: 'Fira Code',
    headingTracking: '-0.01em',
    bodySize: '1.125rem',
  },
  siteIdentity: {
    logo: '/uploads/logo.svg',
    wordmark: 'TestStudio',
    tagline: 'Test tagline.',
  },
  header: {
    variant: 'solid',
    menu: [{ label: 'Work', href: '/work' }],
  },
  hero: {
    variant: 'fracture-ring',
    monolithCount: 12,
    showChapterRail: false,
  },
  footer: {
    kicker: 'Test kicker',
    cta: 'Test CTA',
    wordmarkItalic: false,
  },
  customCss: '.test { color: red; }',
};

const originalFetch = globalThis.fetch;

type FetchMock = ReturnType<typeof vi.fn>;

function mockFetchJson(payload: unknown, ok = true): FetchMock {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(payload),
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function mockFetchReject(error: unknown): FetchMock {
  const fetchMock = vi.fn().mockRejectedValue(error);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function restoreFetch(): void {
  globalThis.fetch = originalFetch;
}

describe('fetchDesignSettings', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CMS_URL = CMS_URL;
  });

  afterEach(() => {
    restoreFetch();
    delete process.env.NEXT_PUBLIC_CMS_URL;
  });

  it('returns defaults when the CMS URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_CMS_URL;
    await expect(fetchDesignSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('parses the Strapi v4 shape (data.attributes)', async () => {
    mockFetchJson({ data: { id: 1, attributes: cmsFields } });
    const settings = await fetchDesignSettings();
    expect(settings.colors.gold).toBe('#B8912F');
    expect(settings.typography.headingFont).toBe('Playfair Display');
    expect(settings.siteIdentity.wordmark).toBe('TestStudio');
    expect(settings.header.variant).toBe('solid');
    expect(settings.hero.monolithCount).toBe(12);
    expect(settings.footer.cta).toBe('Test CTA');
    expect(settings.customCss).toBe('.test { color: red; }');
  });

  it('parses the Strapi v5 flattened shape (data without attributes)', async () => {
    mockFetchJson({ data: { id: 1, documentId: 'abc', ...cmsFields } });
    const settings = await fetchDesignSettings();
    expect(settings.colors.gold).toBe('#B8912F');
    expect(settings.typography.bodyFont).toBe('Roboto');
    expect(settings.siteIdentity.tagline).toBe('Test tagline.');
    expect(settings.header.menu).toEqual([{ label: 'Work', href: '/work' }]);
    expect(settings.hero.variant).toBe('fracture-ring');
  });

  it('resolves v4 media, v5 flattened media, and plain-string logos', async () => {
    mockFetchJson({
      data: {
        siteIdentity: { logo: { data: { attributes: { url: '/v4-logo.svg' } } } },
      },
    });
    await expect(fetchDesignSettings()).resolves.toMatchObject({
      siteIdentity: expect.objectContaining({ logo: '/v4-logo.svg' }),
    });

    mockFetchJson({ data: { siteIdentity: { logo: { url: '/v5-logo.svg' } } } });
    await expect(fetchDesignSettings()).resolves.toMatchObject({
      siteIdentity: expect.objectContaining({ logo: '/v5-logo.svg' }),
    });

    mockFetchJson({ data: { siteIdentity: { logo: '/plain-logo.svg' } } });
    await expect(fetchDesignSettings()).resolves.toMatchObject({
      siteIdentity: expect.objectContaining({ logo: '/plain-logo.svg' }),
    });
  });

  it('fills missing fields from defaults on partial payloads', async () => {
    mockFetchJson({ data: { colors: { gold: '#B8912F' } } });
    const settings = await fetchDesignSettings();
    expect(settings.colors.gold).toBe('#B8912F');
    expect(settings.colors.void).toBe(DEFAULT_SETTINGS.colors.void);
    expect(settings.typography).toEqual(DEFAULT_SETTINGS.typography);
  });

  it('falls back to defaults on HTTP errors, empty data, and thrown errors', async () => {
    mockFetchJson({ error: 'boom' }, false);
    await expect(fetchDesignSettings()).resolves.toEqual(DEFAULT_SETTINGS);

    mockFetchJson({ data: null });
    await expect(fetchDesignSettings()).resolves.toEqual(DEFAULT_SETTINGS);

    mockFetchReject(new Error('network down'));
    await expect(fetchDesignSettings()).resolves.toEqual(DEFAULT_SETTINGS);
  });
});

describe('publishDesignSettings', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CMS_URL = CMS_URL;
  });

  afterEach(() => {
    restoreFetch();
    delete process.env.NEXT_PUBLIC_CMS_URL;
  });

  it('PUTs the settings to Strapi with exactly one request (no client revalidate)', async () => {
    const fetchMock = mockFetchJson({ data: { id: 1 } });
    await publishDesignSettings(DEFAULT_SETTINGS);

    const calls = fetchMock.mock.calls as Array<[string, { method?: string; body?: string }]>;
    expect(calls).toHaveLength(1);
    const [url, init] = calls[0];
    expect(url).toBe(`${CMS_URL}/api/design-settings`);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body ?? '{}')).toEqual({
      data: {
        colors: DEFAULT_SETTINGS.colors,
        typography: DEFAULT_SETTINGS.typography,
        siteIdentity: DEFAULT_SETTINGS.siteIdentity,
        header: DEFAULT_SETTINGS.header,
        hero: DEFAULT_SETTINGS.hero,
        footer: DEFAULT_SETTINGS.footer,
        customCss: DEFAULT_SETTINGS.customCss,
      },
    });
  });

  it('is a no-op without a CMS URL and swallows network errors', async () => {
    delete process.env.NEXT_PUBLIC_CMS_URL;
    const fetchMockFn = vi.fn();
    globalThis.fetch = fetchMockFn as unknown as typeof fetch;
    await expect(publishDesignSettings(DEFAULT_SETTINGS)).resolves.toBeUndefined();
    expect(fetchMockFn).not.toHaveBeenCalled();

    process.env.NEXT_PUBLIC_CMS_URL = CMS_URL;
    mockFetchReject(new Error('network down'));
    await expect(publishDesignSettings(DEFAULT_SETTINGS)).resolves.toBeUndefined();
  });
});

describe('injectDesignTokens', () => {
  it('emits brand CSS variables and passes custom CSS through', () => {
    const css = injectDesignTokens(DEFAULT_SETTINGS);
    expect(css).toContain('--sl-void: #0A0A0B');
    expect(css).toContain("--sl-heading-font: 'Bodoni Moda'");
    expect(css).toContain('color-scheme: dark');
  });

  it('reflects overridden values', () => {
    const css = injectDesignTokens({
      ...DEFAULT_SETTINGS,
      colors: { ...DEFAULT_SETTINGS.colors, gold: '#B8912F' },
      customCss: '.custom { color: red; }',
    });
    expect(css).toContain('--sl-gold: #B8912F');
    expect(css).toContain('.custom { color: red; }');
  });
});
