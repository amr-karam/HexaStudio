// Use build-time env vars with fallbacks to production URLs.
// If the env var is set but is a localhost URL (not reachable from production),
// use the production fallback instead.
const isLocalhostUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    // Check for localhost, 127.0.0.1, 0.0.0.0, or any subdomain of localhost
    return hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname === '0.0.0.0' ||
           hostname.endsWith('.localhost') ||
           hostname.endsWith('.local') ||
           hostname === 'host.docker.internal';
  } catch {
    return false;
  }
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL && !isLocalhostUrl(process.env.NEXT_PUBLIC_API_URL) ?
    process.env.NEXT_PUBLIC_API_URL :
    'https://api.hexastudio.net';

export const CMS_BASE_URL =
  process.env.NEXT_PUBLIC_CMS_URL && !isLocalhostUrl(process.env.NEXT_PUBLIC_CMS_URL) ?
    process.env.NEXT_PUBLIC_CMS_URL :
    'https://cms.hexastudio.net';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && !isLocalhostUrl(process.env.NEXT_PUBLIC_SITE_URL) ?
    process.env.NEXT_PUBLIC_SITE_URL :
    'https://hexastudio.net';
