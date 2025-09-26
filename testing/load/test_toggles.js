import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

export const cache_hit_rate = new Rate('cache_hit_rate');

const BASE_URL = 'http://127.0.0.1:4000';

export default function () {  
  // Test status endpoint
  const statusRes = http.get(`${BASE_URL}/api/messages/status`);
  
  check(statusRes, {
    'status endpoint responds': (r) => r.status === 200,
    'response has cache status': (r) => r.json('cache') !== undefined,
    'response has websocket status': (r) => r.json('websocket') !== undefined,
  });
  
  console.log('Cache Status:', JSON.stringify(statusRes.json('cache')));
  console.log('WebSocket Status:', JSON.stringify(statusRes.json('websocket')));
  
  // Test message endpoint with headers
  const CHAT_ID = 1;
  const messagesRes = http.get(`${BASE_URL}/api/messages/${CHAT_ID}`);
  check(messagesRes, {
  'messages endpoint responds': (r) => r.status === 200,
  'has cache status header': (r) => r.headers['X-Cache-Status'] !== undefined,
  'has response time header': (r) => r.headers['X-Response-Time'] !== undefined,
  'has cache enabled header': (r) => r.headers['X-Cache-Enabled'] !== undefined,
});
  
  const headers = messagesRes.headers || {};
  const xCacheStatus = headers['X-Cache-Status'] || headers['x-cache-status'];
  const xResponseTime = headers['X-Response-Time'] || headers['x-response-time'];
  const xCacheEnabled = headers['X-Cache-Enabled'] || headers['x-cache-enabled'];

  // Record cache HITs for summary metric
  cache_hit_rate.add(xCacheStatus === 'HIT');

  console.log('Cache Status Header:', xCacheStatus);
  console.log('Response Time:', xResponseTime);
  console.log('Cache Enabled:', xCacheEnabled);
}
