import { describe, it, expect } from 'vitest';
import { slugify, isValidEmail, clamp } from '@hexastudio/utils';

describe('Utility Functions', () => {
  describe('slugify', () => {
    it('should convert text to a URL-friendly slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('  Hello World  ')).toBe('hello-world');
      expect(slugify('Hello_World-Test')).toBe('hello-world-test');
      expect(slugify('Special @#$% Characters')).toBe('special-characters');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test@domain')).toBe(true); // RFC 5322: single-label domains are valid
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('clamp', () => {
    it('should clamp values correctly', () => {
      expect(clamp(10, 0, 5)).toBe(5);
      expect(clamp(-10, 0, 5)).toBe(0);
      expect(clamp(3, 0, 5)).toBe(3);
    });
  });
});
