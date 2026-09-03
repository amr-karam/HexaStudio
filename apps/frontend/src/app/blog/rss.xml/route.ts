import { SITE_URL } from '@/config/constants';
import { fetchArticles } from '@/features/blog/lib/fetchArticles';

export const dynamic = 'force-static';
export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET(): Promise<Response> {
  const { articles } = await fetchArticles();

  const items = articles
    .filter((a) => a.slug)
    .map((a) => {
      const pubDate = a.createdAt ? new Date(a.createdAt).toUTCString() : '';
      const link = `${SITE_URL}/blog/${a.slug}`;
      const imageTag = a.coverImage
        ? `<enclosure url="${escapeXml(a.coverImage)}" type="image/jpeg" />`
        : '';
      const tags = (a.tags ?? []).map((t) => `<category>${escapeXml(t)}</category>`).join('');
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(a.excerpt || '')}</description>
      ${imageTag}
      <author>${escapeXml(a.author || 'HexaStudio')}</author>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${tags}
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HexaStudio Blog</title>
    <link>${escapeXml(SITE_URL)}/blog</link>
    <description>Insights on architectural visualization, 3D technology, and design.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/blog/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
