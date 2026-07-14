/**
 * admin-ip-guard.ts
 * Strapi 5 custom middleware that restricts /admin routes to trusted IPs.
 *
 * Configure allowed IPs via the CMS_ALLOWED_IPS environment variable:
 *   CMS_ALLOWED_IPS=192.168.1.0/24,10.0.0.1,156.206.135.186
 *
 * When CMS_ALLOWED_IPS is NOT set, the guard is disabled (open access).
 * This allows local development without configuration.
 */

import type { Core } from '@strapi/strapi';

const ADMIN_PATH_PREFIX = '/admin';

function parseAllowedIPs(): string[] {
  const raw = process.env.CMS_ALLOWED_IPS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

/**
 * Extract the real client IP, respecting common proxy headers.
 * Strapi runs behind Traefik which sets X-Forwarded-For.
 */
function getClientIP(ctx: any): string {
  const forwarded = ctx.request.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return ctx.request.ip ?? '';
}

export default (config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Allow all requests from the internal network (Backend, etc.)
    const clientIP = getClientIP(ctx);
    if (clientIP.startsWith('172.')) {
      return next();
    }

    // Only guard admin routes
    if (!ctx.path.startsWith(ADMIN_PATH_PREFIX)) {
      return next();
    }

    const allowedIPs = parseAllowedIPs();
    if (allowedIPs.length === 0) {
      return next();
    }

    if (!allowedIPs.includes(clientIP)) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden', message: 'Access to the admin panel is restricted.' };
      return;
    }

    return next();
  };
};
      return;
    }

    strapi.log.debug(`[admin-ip-guard] Allowed ${clientIP} → ${ctx.path}`);
    return next();
  };
};
