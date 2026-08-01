// HEXA alert webhook receiver — Alertmanager -> Telegram/Discord
// Zero-dependency Node HTTP server. Receives Alertmanager webhook payloads
// at POST /alert, logs them as JSON lines (picked up by Promtail/Loki), and
// forwards to Telegram and/or Discord when configured via env vars.
const http = require('http');

const PORT = 9000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

const severityEmoji = (s) => (s === 'critical' ? '\u{1F6D1}' : s === 'warning' ? '\u{26A0}\u{FE0F}' : '\u{2139}\u{FE0F}');

function formatAlert(a) {
  const labels = a.labels || {};
  const anns = a.annotations || {};
  const sev = labels.severity || 'unknown';
  const lines = [
    `${severityEmoji(sev)} [${sev}] ${anns.summary || labels.alertname || 'Alert'}`,
  ];
  if (anns.description) lines.push(anns.description);
  const extras = [];
  if (labels.instance) extras.push(`instance=${labels.instance}`);
  if (labels.job) extras.push(`job=${labels.job}`);
  if (labels.node) extras.push(`node=${labels.node}`);
  if (a.value) extras.push(`value=${a.value}`);
  if (extras.length) lines.push(extras.join(' '));
  lines.push(a.status === 'firing'
    ? `\u{25B6} firing since ${a.startsAt}`
    : `\u{2705} resolved at ${a.endsAt || new Date().toISOString()}`);
  return lines.join('\n');
}

async function notifyTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch (e) {
    console.error(`telegram send failed: ${e.message}`);
    return false;
  }
}

async function notifyDiscord(text) {
  if (!DISCORD_WEBHOOK_URL) return false;
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });
    return res.ok;
  } catch (e) {
    console.error(`discord send failed: ${e.message}`);
    return false;
  }
}

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('ok');
    }
    if (req.method !== 'POST' || req.url !== '/alert') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('not found');
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) req.destroy(); // 1 MB cap
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const alerts = Array.isArray(payload.alerts) ? payload.alerts : [];
        const results = { received: alerts.length, telegram: 0, discord: 0 };
        for (const a of alerts) {
          const labels = a.labels || {};
          console.log(JSON.stringify({
            ts: new Date().toISOString(),
            status: a.status,
            alertname: labels.alertname,
            severity: labels.severity,
            instance: labels.instance,
            job: labels.job,
            summary: (a.annotations || {}).summary,
          }));
          const text = formatAlert(a);
          if (await notifyTelegram(text)) results.telegram++;
          if (await notifyDiscord(text)) results.discord++;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      } catch (err) {
        console.error(`webhook error: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  })
  .listen(PORT, () => {
    console.log(`webhook receiver listening on :${PORT}`);
  });
