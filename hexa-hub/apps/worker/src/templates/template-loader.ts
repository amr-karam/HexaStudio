import * as fs from 'fs';
import * as path from 'path';

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');

const templateCache = new Map<string, string>();

/**
 * Load an HTML email template by name (without the `.html` extension).
 * Templates are cached in memory after first load.
 */
export function loadTemplate(templateName: string): string {
  const cached = templateCache.get(templateName);
  if (cached) return cached;

  const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Email template "${templateName}" not found at ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  templateCache.set(templateName, content);

  return content;
}

/**
 * Render an HTML email template by replacing `{{variable}}` placeholders.
 * Plain-text fallback is extracted from the leading HTML comment.
 */
export function renderTemplate(
  templateName: string,
  context: Record<string, unknown> = {},
): { html: string; text: string } {
  const template = loadTemplate(templateName);

  // Replace {{variable}} with context values
  let html = template;
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g');
    html = html.replace(regex, String(value ?? ''));
  }

  // Handle Handlebars-style {{#each}} blocks (basic implementation)
  html = renderEachBlocks(html, context);

  // Handle {{^arrayName}} inverted (else) blocks
  html = renderInvertedBlocks(html, context);

  // Extract plain-text fallback from the HTML comment at the top
  const text = extractPlainTextFallback(template, context);

  return { html, text };
}

// ─── Helpers ────────────────────────────────────────────────────────────

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderEachBlocks(
  html: string,
  context: Record<string, unknown>,
): string {
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return html.replace(eachRegex, (_match: string, arrayName: string, blockContent: string) => {
    const items = context[arrayName];
    if (!Array.isArray(items) || items.length === 0) return '';

    return items
      .map((item: Record<string, unknown>) => {
        let rendered = blockContent;
        for (const [key, value] of Object.entries(item)) {
          const itemRegex = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g');
          rendered = rendered.replace(itemRegex, String(value ?? ''));
        }
        return rendered;
      })
      .join('');
  });
}

function renderInvertedBlocks(
  html: string,
  context: Record<string, unknown>,
): string {
  const invertedRegex = /\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;

  return html.replace(invertedRegex, (_match: string, arrayName: string, blockContent: string) => {
    const items = context[arrayName];
    if (Array.isArray(items) && items.length > 0) return '';

    return blockContent;
  });
}

function extractPlainTextFallback(
  template: string,
  context: Record<string, unknown>,
): string {
  const commentMatch = /<!--\s*([\s\S]*?)-->/m.exec(template);
  if (!commentMatch || !commentMatch[1]) {
    // Fallback: simple text from context
    return `HEXA Hub Notification\n\n${Object.entries(context)
      .filter(([key]) => !Array.isArray(context[key]))
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join('\n')}`;
  }

  let text = commentMatch[1].trim();

  // Replace variables in the plain-text fallback
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const regex = new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g');
      text = text.replace(regex, String(value));
    }
  }

  return text;
}
