import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/preview/route';

vi.mock('next/headers', () => ({
  draftMode: vi.fn().mockResolvedValue({
    enable: vi.fn(),
    disable: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => {
  class MockRedirectError extends Error {
    target: string;
    constructor(target: string) {
      super(`NEXT_REDIRECT: ${target}`);
      this.target = target;
    }
  }
  return {
    redirect: (target: string): never => {
      throw new MockRedirectError(target);
    },
  };
});

interface RedirectedTarget {
  target?: string;
}

function makePreviewRequest(url: string): NextRequest {
  return new NextRequest(`http://localhost/api/preview${url}`);
}

async function runPreview(url: string): Promise<{ status?: number; target?: string }> {
  try {
    const response = await GET(makePreviewRequest(url));
    return { status: response.status };
  } catch (error) {
    return { target: (error as RedirectedTarget).target };
  }
}

describe('GET /api/preview', () => {
  beforeEach(() => {
    vi.stubEnv('PREVIEW_SECRET', 'test-secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects a request with an invalid secret', async () => {
    const result = await runPreview('?secret=wrong&url=/blog/post');

    expect(result.status).toBe(401);
  });

  it('redirects to a valid internal blog path', async () => {
    const result = await runPreview('?secret=test-secret&url=/blog/post');

    expect(result.target).toBe('/blog/post');
  });

  it('redirects to a valid internal project path', async () => {
    const result = await runPreview('?secret=test-secret&url=/projects/villa-horizon');

    expect(result.target).toBe('/projects/villa-horizon');
  });

  it('redirects to a valid single-segment page', async () => {
    const result = await runPreview('?secret=test-secret&url=/about');

    expect(result.target).toBe('/about');
  });

  it('redirects to "/" when no url is provided', async () => {
    const result = await runPreview('?secret=test-secret');

    expect(result.target).toBe('/');
  });

  it.each([
    ['?secret=test-secret&url=//evil.com', 'protocol-relative URL'],
    ['?secret=test-secret&url=/\\evil.com', 'backslash-prefixed URL'],
    ['?secret=test-secret&url=javascript:alert(1)', 'javascript scheme'],
    ['?secret=test-secret&url=https://evil.com', 'absolute URL'],
    ['?secret=test-secret&url=/blog/../admin', 'dot-dot path traversal'],
    ['?secret=test-secret&url=/blog/post?x=1', 'query string in target'],
  ])('rejects an unsafe redirect target (%s)', async (query, _label) => {
    const result = await runPreview(query);

    expect(result.status).toBe(400);
  });
});