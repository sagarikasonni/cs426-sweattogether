// Measures the Redis cache effect WITHOUT restarting the server: it splits
// response latency by the X-Cache-Status header (MISS = served from MongoDB,
// HIT = served from Redis), so the HIT-vs-MISS gap is the caching benefit.
//
// Run (defaults to localhost, modest load so a laptop can handle it):
//   k6 run testing/load/latency_ab.js
//   k6 run -e BASE_URL=http://127.0.0.1:4000 -e VUS=50 -e DURATION=30s latency_ab.js
import http from 'k6/http';
import { Trend, Rate } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:4000';

const hitLatency = new Trend('latency_hit_ms', true);
const missLatency = new Trend('latency_miss_ms', true);
const cacheHitRate = new Rate('cache_hit_rate');

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || '30s',
};

// ID_MAX controls the chat-id space: a small range stays cached (Redis HITs),
// a large range busts the cache so requests fall through to MongoDB (MISSes).
const ID_MAX = Number(__ENV.ID_MAX || 10);

export default function () {
  const chatId = Math.floor(Math.random() * ID_MAX) + 1;
  const res = http.get(`${BASE}/api/messages/${chatId}`);
  const status = (res.headers['X-Cache-Status'] || res.headers['x-cache-status'] || '').toUpperCase();

  if (status === 'HIT') {
    hitLatency.add(res.timings.duration);
  } else if (status === 'MISS') {
    missLatency.add(res.timings.duration);
  }
  cacheHitRate.add(status === 'HIT');
}
