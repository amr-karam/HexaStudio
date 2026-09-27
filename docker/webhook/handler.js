const http = require('http');
const crypto = require('crypto');

const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-secret-change-in-production';

function verifySignature(payload, signature) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Health check endpoint
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'webhook-handler',
      version: '1.0.0'
    }));
    return;
  }

  // Readiness check
  if (url.pathname === '/ready' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ready', 
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // GitLab webhook endpoint
  if (url.pathname === '/gitlab' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const signature = req.headers['x-gitlab-token'] || '';
      
      if (!verifySignature(body, signature)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
      }

      const payload = JSON.parse(body);
      console.log('[Webhook] GitLab event received:', payload.object_kind || 'unknown');

      // Process different GitLab event types
      switch (payload.object_kind) {
        case 'push':
          console.log('[Webhook] Push event:', payload.project?.name, payload.ref);
          break;
        case 'merge_request':
          console.log('[Webhook] Merge request:', payload.object_attributes?.action);
          break;
        case 'pipeline':
          console.log('[Webhook] Pipeline:', payload.object_attributes?.status);
          break;
        case 'deployment':
          console.log('[Webhook] Deployment:', payload.deployment?.status);
          break;
        default:
          console.log('[Webhook] Unhandled event type:', payload.object_kind);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true, event: payload.object_kind }));
    } catch (err) {
      console.error('[Webhook] Error processing GitLab webhook:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid payload' }));
    }
    return;
  }

  // Generic webhook endpoint for other services
  if (url.pathname === '/webhook' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const signature = req.headers['x-signature'] || req.headers['x-hub-signature-256'] || '';
      
      if (!verifySignature(body, signature)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
      }

      const payload = JSON.parse(body);
      console.log('[Webhook] Generic webhook received:', Object.keys(payload));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      console.error('[Webhook] Error processing generic webhook:', err);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid payload' }));
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Webhook] Server running on port ${PORT}`);
  console.log(`[Webhook] Health: http://localhost:${PORT}/health`);
  console.log(`[Webhook] Ready: http://localhost:${PORT}/ready`);
  console.log(`[Webhook] GitLab: http://localhost:${PORT}/gitlab`);
  console.log(`[Webhook] Generic: http://localhost:${PORT}/webhook`);
});

process.on('SIGTERM', () => {
  console.log('[Webhook] SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Webhook] SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});