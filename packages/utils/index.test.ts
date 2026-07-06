import { formatDate, slugify, isValidEmail, clamp } from './index';

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });

  it('formats a Date object correctly', () => {
    const date = new Date('2024-12-25');
    const result = formatDate(date);
    expect(result).toBe('December 25, 2024');
  });

  it('handles invalid dates gracefully', () => {
    const result = formatDate('invalid-date');
    expect(result).toBe('Invalid Date');
  });
});

describe('slugify', () => {
  it('converts text to URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test Title Here')).toBe('test-title-here');
  });

  it('removes special characters', () => {
    expect(slugify('Hello@World!')).toBe('helloworld');
    expect(slugify('Test_With_Underscores')).toBe('test-with-underscores');
  });

  it('handles multiple spaces and hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
    expect(slugify('Test---Title')).toBe('test-title');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--Hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('isValidEmail', () => {
  it('validates correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test example.com')).toBe(false);
  });

  it('handles empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('handles edge cases', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(-15, -20, -10)).toBe(-15);
    expect(clamp(-25, -20, -10)).toBe(-20);
    expect(clamp(-5, -20, -10)).toBe(-10);
  });
});
