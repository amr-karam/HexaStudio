import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('/api/health Route Handler', () => {
  it('returns HTTP 200 with ok status and service metadata', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('hexastudio-frontend');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    expect(response.headers.get('X-Service-Name')).toBe('hexastudio-frontend');
  });
});
