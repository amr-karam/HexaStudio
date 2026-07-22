/**
 * Parses an achievement value string like "12+", "200+", "8", "100%" into
 * its numeric part and trailing suffix so the awards wall can count the
 * number up from 0 (easeOutExpo, run-once) while preserving the suffix.
 */
export interface ParsedStatValue {
  numeric: number;
  suffix: string;
}

export function parseStatValue(raw: string): ParsedStatValue {
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return { numeric: 0, suffix: raw };
  return { numeric: parseInt(match[1], 10), suffix: match[2] };
}
