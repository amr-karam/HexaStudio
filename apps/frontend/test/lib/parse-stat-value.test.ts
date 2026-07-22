import { describe, it, expect } from 'vitest';
import { parseStatValue } from '@/features/portfolio/lib/parse-stat-value';

describe('parseStatValue', () => {
  it.each([
    ['12+', 12, '+'],
    ['200+', 200, '+'],
    ['8', 8, ''],
    ['100%', 100, '%'],
    ['35 awards', 35, ' awards'],
  ])('parses "%s" into %i + "%s"', (raw, numeric, suffix) => {
    expect(parseStatValue(raw)).toEqual({ numeric, suffix });
  });

  it('returns 0 with the raw suffix when there is no leading number', () => {
    expect(parseStatValue('Years')).toEqual({ numeric: 0, suffix: 'Years' });
    expect(parseStatValue('')).toEqual({ numeric: 0, suffix: '' });
  });
});
