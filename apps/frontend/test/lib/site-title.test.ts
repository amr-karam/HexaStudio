import { describe, expect, it } from 'vitest';
import { siteTitleSegment } from '@/lib/site-title';

describe('siteTitleSegment', () => {
  it('strips a trailing HexaStudio suffix', () => {
    expect(siteTitleSegment('About | HexaStudio')).toBe('About');
    expect(siteTitleSegment('Privacy Policy | HexaStudio')).toBe('Privacy Policy');
  });

  it('leaves plain segments unchanged', () => {
    expect(siteTitleSegment('About')).toBe('About');
  });
});
