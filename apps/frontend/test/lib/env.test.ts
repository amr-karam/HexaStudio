import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports apiUrl from constants', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://test-api.example.com');
    const { env } = await import('@/lib/env');
    // constants.ts reads process.env at module load time
    expect(env.apiUrl).toBeDefined();
  });

  it('exports cmsUrl from constants', async () => {
    const { env } = await import('@/lib/env');
    expect(env.cmsUrl).toBeDefined();
  });

  it('exports siteUrl from constants', async () => {
    const { env } = await import('@/lib/env');
    expect(env.siteUrl).toBeDefined();
  });

  it('exports sentryDsn from env', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.example.com/dsn');
    const { env } = await import('@/lib/env');
    expect(env.sentryDsn).toBe('https://sentry.example.com/dsn');
  });
});
