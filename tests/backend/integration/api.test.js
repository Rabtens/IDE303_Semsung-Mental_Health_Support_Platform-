const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../../../app');

describe('Semzung API', () => {
  let dataDir;
  let app;

  beforeEach(() => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'semzung-test-'));
    app = createApp({
      dataDir,
      serveStatic: false,
      now: () => new Date('2026-06-06T12:00:00.000Z'),
      fetchImpl: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Supportive reply' } }] }),
      }),
    });
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
    delete process.env.GROQ_API_KEY;
  });

  test('reports health and sets security headers', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('persists and clears a conversation', async () => {
    const history = [{ role: 'user', content: 'hello' }];
    await request(app).post('/api/conversation/session-1').send({ history }).expect(200);
    const saved = await request(app).get('/api/conversation/session-1').expect(200);
    expect(saved.body.history).toEqual(history);
    await request(app).delete('/api/conversation/session-1').expect(200);
    const cleared = await request(app).get('/api/conversation/session-1').expect(200);
    expect(cleared.body.history).toEqual([]);
  });

  test('validates and analyzes mood entries', async () => {
    await request(app).post('/api/mood').send({ mood_score: 8, session_id: 'session-1' }).expect(400);
    await request(app).post('/api/mood').send({ mood_score: 4, session_id: 'session-1' }).expect(200);
    const today = await request(app).get('/api/mood/today?sessionId=session-1').expect(200);
    expect(today.body.mood.mood_score).toBe(4);
    const weekly = await request(app).get('/api/mood/weekly?sessionId=session-1').expect(200);
    expect(weekly.body.average_mood).toBe(4);
  });

  test('creates and retrieves a profile', async () => {
    await request(app).post('/api/profile').send({ user_id: 'user-1', display_name: 'Test User' }).expect(200);
    const response = await request(app).get('/api/profile/user-1').expect(200);
    expect(response.body.profile.display_name).toBe('Test User');
  });

  test('proxies chat without exposing the provider key', async () => {
    process.env.GROQ_API_KEY = 'server-only-key';
    const response = await request(app)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'hello' }] })
      .expect(200);
    expect(response.body.reply).toBe('Supportive reply');
  });
});
