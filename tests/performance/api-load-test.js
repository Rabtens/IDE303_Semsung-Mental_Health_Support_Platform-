import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '15s',
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export default function () {
  const health = http.get(`${baseUrl}/api/health`);
  check(health, { 'health endpoint is available': (response) => response.status === 200 });

  const mood = http.get(`${baseUrl}/api/mood/weekly?sessionId=k6-test`);
  check(mood, { 'mood endpoint is available': (response) => response.status === 200 });
  sleep(1);
}
