/**
 * Strip a trailing "| HexaStudio" so the root layout template
 * (`%s | HexaStudio`) is applied exactly once.
 */
export function siteTitleSegment(raw: string): string {
  return raw.replace(/\s*\|\s*HexaStudio\s*$/i, '').trim();
}
