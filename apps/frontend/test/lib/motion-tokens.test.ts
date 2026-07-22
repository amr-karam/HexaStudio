import { describe, it, expect } from 'vitest';
import {
  EASING,
  CSS_EASING,
  GSAP_EASING,
  DUR,
  STAGGER_TOKENS,
  tokenTransition,
} from '@/lib/motion/tokens';

describe('motion tokens (Phase 1)', () => {
  it('exposes the canonical easing curves', () => {
    expect(EASING.easeOutExpo).toEqual([0.16, 1, 0.3, 1]);
    expect(EASING.easeInOutQuint).toEqual([0.76, 0, 0.24, 1]);
  });

  it('exposes the canonical durations', () => {
    expect(DUR).toEqual({ micro: 0.2, ui: 0.4, scene: 0.8, transition: 0.7 });
  });

  it('exposes stagger intervals within spec ranges', () => {
    expect(STAGGER_TOKENS.chars).toBeGreaterThanOrEqual(0.02);
    expect(STAGGER_TOKENS.chars).toBeLessThanOrEqual(0.04);
    expect(STAGGER_TOKENS.cards).toBe(0.06);
    expect(STAGGER_TOKENS.lines).toBe(0.08);
  });

  it('mirrors easing curves across CSS and GSAP forms', () => {
    expect(CSS_EASING.easeInOutQuint).toBe('cubic-bezier(0.76, 0, 0.24, 1)');
    expect(GSAP_EASING.easeOutExpo).toBe('expo.out');
    expect(GSAP_EASING.easeInOutQuint).toBe('quint.inOut');
  });

  it('builds Framer Motion transitions from tokens', () => {
    expect(tokenTransition('easeInOutQuint', 'ui', 0.1)).toEqual({
      ease: [0.76, 0, 0.24, 1],
      duration: 0.4,
      delay: 0.1,
    });
  });
});
