import http from "k6/http";
import { Rate } from "k6/metrics";

export const cache_hit_rate = new Rate("cache_hit_rate");

// Host is configurable via env var so the same script runs locally and on EC2:
//   k6 run -e BASE_URL=http://127.0.0.1:4000 http_test.js
const BASE = __ENV.BASE_URL || 'http://127.0.0.1:4000';

export const options = {
  scenarios: {
    warmup: {
      executor: "constant-vus",
      vus: 100,
      duration: "30s",
      exec: "warmup", // GET-only phase to seed Redis
    },
    load: {
      executor: "ramping-vus",
      startTime: "30s", // starts after warmup completes
      stages: [
        { duration: "1m", target: 500 },   // warm up
        { duration: "2m", target: 1000 },  // ramp mid
        { duration: "2m", target: 2000 },  // push upper limit
        { duration: "1m", target: 0 },     // cool down
      ],
      exec: "load", // main test
    },
  },
  thresholds: {
    "http_req_duration{scenario:load}": ["p(95)<2000"], // adjust as realistic target
    "cache_hit_rate": ["rate>0.7"], // expect at least 70% HITs once warmed
  },
};

// Warmup phase — fixed IDs so Redis can cache them
export function warmup() {
  const chatId = 1;
  const res = http.get(`${BASE}/api/messages/${chatId}`);
  const xs = res.headers["X-Cache-Status"] || res.headers["x-cache-status"];
  cache_hit_rate.add(xs === "HIT");
}

// Load phase — random IDs, simulating real traffic
export function load() {
  const chatId = Math.floor(Math.random() * 10) + 1;
  const res = http.get(`${BASE}/api/messages/${chatId}`);
  const xs = res.headers["X-Cache-Status"] || res.headers["x-cache-status"];
  cache_hit_rate.add(xs === "HIT");

  // Optionally gate POST requests so they don’t overwrite cache
  if (__ENV.SHOULD_POST === "true") {
    http.post(`${BASE}/api/messages/${chatId}`, JSON.stringify({ text: "Test" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
