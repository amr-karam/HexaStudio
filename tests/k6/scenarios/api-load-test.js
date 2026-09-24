import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    response_time: ['p(95)<500'],
    http_req_duration: ['p(99)<1000'],
    http_req_failed: ['rate<0.02'],
  },
};

const PUBLIC_ENDPOINTS = [
  { path: '/', name: 'root' },
  { path: '/health', name: 'health' },
  { path: '/articles', name: 'articles' },
  { path: '/projects', name: 'projects' },
  { path: '/services', name: 'services' },
  { path: '/testimonials', name: 'testimonials' },
  { path: '/site-settings', name: 'site-settings' },
];

export default function () {
  group('Public API Endpoints', () => {
    for (const { path, name } of PUBLIC_ENDPOINTS) {
      const url = `${BASE_URL}${path}`;
      const res = http.get(url, { tags: { name } });
      const passed = check(res, {
        [`${name} status 200`]: (r) => r.status === 200,
        [`${name} duration < 500ms`]: (r) => r.timings.duration < 500,
      });
      if (!passed) {
        errorRate.add(1);
      }
      responseTime.add(res.timings.duration);
      sleep(0.1);
    }
  });

  group('Contact Form Submission', () => {
    const payload = JSON.stringify({
      name: 'Load Test User',
      email: 'loadtest@example.com',
      message: 'This is an automated load test message.',
    });
    const res = http.post(`${BASE_URL}/contact`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'contact' },
    });
    const passed = check(res, {
      'contact status 201': (r) => r.status === 201,
      'contact duration < 1000ms': (r) => r.timings.duration < 1000,
    });
    if (!passed) {
      errorRate.add(1);
    }
    responseTime.add(res.timings.duration);
  });

  sleep(1);
}
