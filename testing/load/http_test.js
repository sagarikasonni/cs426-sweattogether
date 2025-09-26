import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // Baseline test - Redis disabled, WebSocket disabled
    baseline: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },   // warm-up
        { duration: '1m', target: 500 },    // ramp up
        { duration: '2m', target: 500 },    // hold
        { duration: '30s', target: 0 },     // ramp down
      ],
      gracefulStop: '30s',
      env: { TEST_MODE: 'baseline' },
    },
    // Optimized test - Redis enabled, WebSocket enabled
    optimized: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },   // warm-up
        { duration: '1m', target: 500 },    // ramp up
        { duration: '2m', target: 500 },    // hold
        { duration: '30s', target: 0 },     // ramp down
      ],
      gracefulStop: '30s',
      env: { TEST_MODE: 'optimized' },
    },
  },
  thresholds: {
    http_req_duration: ['p(50)<100', 'p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://127.0.0.1:4000';

export default function () {
  const chatId = Math.floor(Math.random() * 10) + 1;   
  const userId = Math.floor(Math.random() * 100) + 1; 
  
  // Test 1: Get messages (this will test Redis caching)
  const getMessagesRes = http.get(`${BASE_URL}/api/messages/${chatId}`);
  check(getMessagesRes, {
    'get messages status 200': (r) => r.status === 200,
    'get messages has cache headers': (r) => r.headers['X-Cache-Status'] !== undefined,
    'get messages response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test 2: Send a message (this will test WebSocket broadcasting)
  const messagePayload = JSON.stringify({
    senderId: userId,
    chatId: chatId,
    text: `Test message ${Date.now()}`
  });
  
  const sendMessageRes = http.post(`${BASE_URL}/api/messages`, messagePayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(sendMessageRes, {
    'send message status 201': (r) => r.status === 201,
    'send message response time < 300ms': (r) => r.timings.duration < 300,
  });

  // Test 3: Get chat previews
  const getPreviewsRes = http.get(`${BASE_URL}/api/messages/previews`);
  check(getPreviewsRes, {
    'get previews status 200': (r) => r.status === 200,
    'get previews response time < 150ms': (r) => r.timings.duration < 150,
  });

  // Test 4: Check status endpoint
  const statusRes = http.get(`${BASE_URL}/api/messages/status`);
  check(statusRes, {
    'status endpoint works': (r) => r.status === 200,
  });

  // Log performance data for analysis
  console.log(JSON.stringify({
    test_mode: __ENV.TEST_MODE,
    timestamp: new Date().toISOString(),
    get_messages: {
      status: getMessagesRes.status,
      duration: getMessagesRes.timings.duration,
      cache_status: getMessagesRes.headers['X-Cache-Status'],
      cache_enabled: getMessagesRes.headers['X-Cache-Enabled'],
    },
    send_message: {
      status: sendMessageRes.status,
      duration: sendMessageRes.timings.duration,
    },
    get_previews: {
      status: getPreviewsRes.status,
      duration: getPreviewsRes.timings.duration,
    }
  }));

  sleep(1);
}
