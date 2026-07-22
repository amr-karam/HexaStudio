import { describe, it, expect } from 'vitest';
import {
  clamp,
  velocityToSkew,
  velocityToSpeedFactor,
  MAX_MARQUEE_SKEW_DEG,
  MAX_MARQUEE_SPEED_FACTOR,
} from '@/lib/motion/scroll-utils';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('clamps to min and max', () => {
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
  });
});

describe('velocityToSkew', () => {
  it('is 0 at rest', () => {
    expect(velocityToSkew(0)).toBe(0);
  });

  it('leans backwards (negative skew) when scrolling down', () => {
    expect(velocityToSkew(1)).toBe(-MAX_MARQUEE_SKEW_DEG);
  });

  it('leans forwards (positive skew) when scrolling up', () => {
    expect(velocityToSkew(-1)).toBe(MAX_MARQUEE_SKEW_DEG);
  });

  it('scales proportionally at partial velocity', () => {
    expect(velocityToSkew(0.5)).toBeCloseTo(-MAX_MARQUEE_SKEW_DEG / 2);
  });

  it('clamps beyond ±1 velocity', () => {
    expect(velocityToSkew(3)).toBe(-MAX_MARQUEE_SKEW_DEG);
    expect(velocityToSkew(-3)).toBe(MAX_MARQUEE_SKEW_DEG);
  });

  it('respects a custom max', () => {
    expect(velocityToSkew(1, 10)).toBe(-10);
  });
});

describe('velocityToSpeedFactor', () => {
  it('is exactly 1 at rest so base cadence is preserved', () => {
    expect(velocityToSpeedFactor(0)).toBe(1);
  });

  it('scales with |velocity| regardless of direction', () => {
    expect(velocityToSpeedFactor(0.4)).toBeCloseTo(2);
    expect(velocityToSpeedFactor(-0.4)).toBeCloseTo(2);
  });

  it('is capped at the max factor', () => {
    expect(velocityToSpeedFactor(1)).toBe(MAX_MARQUEE_SPEED_FACTOR);
    expect(velocityToSpeedFactor(5)).toBe(MAX_MARQUEE_SPEED_FACTOR);
  });

  it('honours custom boost and max', () => {
    expect(velocityToSpeedFactor(0.5, { boost: 4, max: 10 })).toBeCloseTo(3);
    expect(velocityToSpeedFactor(1, { boost: 4, max: 2 })).toBe(2);
  });
});
