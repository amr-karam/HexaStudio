export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  services: {
    backend: 'online' | 'offline';
    database: 'online' | 'offline';
    redis: 'online' | 'offline';
    strapi: 'online' | 'offline';
    odoo: 'online' | 'offline';
    vectorStore: 'online' | 'offline';
  };
  metrics: {
    activeSockets: number;
    aiTokensUsedToday: number;
    cacheHitRate: number;
    avgLatencyMs: number;
  };
}
