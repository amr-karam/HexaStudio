/**
 * Escape JSON-LD payload to prevent script-tag injection.
 *
 * Replaces `</` with `<\/` so that no `</script>` sequence can break out of
 * a `<script type="application/ld+json">` block, regardless of user/CMS content.
 */
export function sanitizeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}
