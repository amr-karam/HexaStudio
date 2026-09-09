import { SITE_URL, API_BASE_URL } from '@/config/constants';
import type { Article } from '@hexastudio/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;
export const runtime = 'nodejs';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/**
 * Fetch articles for the RSS feed with a short timeout (3s).
 * During static prerendering the API may be unreachable — we fall back to
 * an empty feed so the build never blocks on network I/O.
 */
async function fetchArticlesForRss(): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { articles?: Article[] };
    return data.articles ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(): Promise<Response> {
  const articles = await fetchArticlesForRss();

  const items = articles
    .filter((a) => a.slug)
    .map((a) => {
      const pubDate = a.createdAt ? new Date(a.createdAt).toUTCString() : '';
      const link = `${SITE_URL}/blog/${a.slug}`;
      const imageTag = a.coverImage
        ? `<enclosure url="${escapeXml(a.coverImage)}" type="image/jpeg" />`
        : '';
      const tags = (a.tags ?? []).map((t) => `<category>${escapeXml(t)}</category>`).join('');
      return `\n    <item>\n      <title>${escapeXml(a.title)}</title>\n      <link>${escapeXml(link)}</link>\n      <guid isPermaLink="true">${escapeXml(link)}</guid>\n      <description>${escapeXml(a.excerpt || '')}</description>\n      ${imageTag}\n      <author>${escapeXml(a.author || 'HexaStudio')}</author>\n      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}\n      ${tags}\n    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>HexaStudio Blog</title>\n    <link>${escapeXml(SITE_URL)}/blog</link>\n    <description>Insights on architectural visualization, 3D technology, and design.</description>\n    <language>en-us</language>\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n    <atom:link href="${escapeXml(SITE_URL)}/blog/rss.xml" rel="self" type="application/rss+xml" />\n    ${items}\n  </channel>\n</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
