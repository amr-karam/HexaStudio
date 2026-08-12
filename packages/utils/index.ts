/**
 * Formats a date string into a more readable format.
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Generates a URL-friendly slug from a string.
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * RFC 5322-compliant email validation (HTML5 pattern).
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
};

/**
 * Clamps a number between a minimum and maximum value.
 */
export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, val));
};
