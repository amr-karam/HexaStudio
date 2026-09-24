import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * SecurityHeadersMiddleware — Sets security headers on all responses.
 *
 * Headers:
 * - Strict-Transport-Security: Enforce HTTPS
 * - X-Content-Type-Options: Prevent MIME sniffing
 * - X-Frame-Options: Prevent clickjacking
 * - X-XSS-Protection: Enable XSS filter (legacy browsers)
 * - Referrer-Policy: Control referrer information
 * - Content-Security-Policy: Restrict resource loading
 * - Permissions-Policy: Restrict browser features
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Strict Transport Security — enforce HTTPS for 1 year
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable XSS filter (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.hexastudio.net https://cms.hexastudio.net",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "media-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
        "upgrade-insecure-requests",
      ].join('; ')
    );

    // Permissions Policy — restrict browser features
    res.setHeader(
      'Permissions-Policy',
      [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=()',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()',
      ].join(', ')
    );

    next();
  }
}
