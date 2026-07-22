/**
 * On-demand ISR revalidation endpoint (Sprint 15 P9).
 *
 * Background: `force-dynamic` was added (commit 28c26ed4) so the build-time
 * prerender doesn't bake empty content when the backend API isn't yet up.
 * That trade-off cost us CDN-cacheable HTML (no s-maxage, no edge caching,
 * every request SSR-rendered) and inflated TTFB by hundreds of milliseconds.
 *
 * This endpoint + `export const revalidate = 3600` on each page replaces
 * that: pages prerender at build (gracefully empty if API down), serve
 * cached HTML for an hour, refresh in the background, and can be purged
 * on demand by the deploy script / CMS webhook once the container is up.
 *
 * Auth: a shared secret in the `x-revalidate-secret` header. The secret
 * is server-only (no NEXT_PUBLIC_ prefix) so it never leaks to the client
 * bundle.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic'; // never cache the revalidation call itself

interface RevalidateRequestBody {
  paths?: string[];
  tags?: string[];
  type?: 'page' | 'layout';
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false; // refuse if unconfigured
  const header = request.headers.get('x-revalidate-secret');
  if (!header) return false;
  // Constant-time comparison to avoid timing oracles.
  if (header.length !== secret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < header.length; i++) {
    mismatch |= header.charCodeAt(i) ^ secret.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    );
  }

  let body: RevalidateRequestBody = {};
  try {
    body = (await request.json()) as RevalidateRequestBody;
  } catch {
    // Empty body is OK — treat as full layout revalidation.
    body = {};
  }

  const type = body.type ?? 'page';
  const paths = Array.isArray(body.paths) ? body.paths : [];
  const tags = Array.isArray(body.tags) ? body.tags : [];

  const revalidated: { paths: string[]; tags: string[] } = {
    paths: [],
    tags: [],
  };

  for (const path of paths) {
    if (typeof path !== 'string' || path.length === 0 || path.length > 200) continue;
    revalidatePath(path, type);
    revalidated.paths.push(path);
  }

  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.length === 0 || tag.length > 200) continue;
    revalidateTag(tag, 'max');
    revalidated.tags.push(tag);
  }

  // Default: revalidate the whole site layout (every ISR page) so the
  // deploy hook can just POST to /api/revalidate with no body.
  if (paths.length === 0 && tags.length === 0) {
    revalidatePath('/', 'layout');
    revalidated.paths.push('/');
  }

  return NextResponse.json({ ok: true, revalidated, timestamp: Date.now() });
}

export function GET(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: 'method-not-allowed',
      hint: 'POST { paths?: string[], tags?: string[], type?: "page"|"layout" }',
    },
    { status: 405, headers: { Allow: 'POST' } },
  );
}