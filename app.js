const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { createJsonStore } = require('./src/storage/jsonStore');
const { getMoodKey, getTodayDate, getWeeklyAnalysis, getMonthlyAnalysis } = require('./src/services/moodAnalysis');
const { getChatResponse } = require('./src/services/chatbot');

function createApp(options = {}) {
  const app = express();
  const rootDir = options.rootDir || __dirname;
  const dataDir = options.dataDir || process.env.DATA_DIR || rootDir;
  const now = options.now || (() => new Date());
  const fetchImpl = options.fetchImpl || global.fetch;
  const conversations = createJsonStore(dataDir, 'conversations.json');
  const moods = createJsonStore(dataDir, 'moods.json');
  const profiles = createJsonStore(dataDir, 'profiles.json');

  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  if (process.env.CORS_ORIGIN) {
    app.use(cors({ origin: process.env.CORS_ORIGIN }));
  }
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.post('/api/chat', async (req, res) => {
    const { messages, specialty = 'general' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages must be a non-empty array' });
    }
    if (messages.some((message) => !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string')) {
      return res.status(400).json({ success: false, error: 'each message must have a valid role and content' });
    }
    try {
      const reply = await getChatResponse({
        messages,
        specialty,
        apiKey: process.env.GROQ_API_KEY,
        fetchImpl,
      });
      return res.json({ success: true, reply });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/conversation/:sessionId', (req, res) => {
    const history = conversations.read()[req.params.sessionId] || [];
    res.json({ success: true, history });
  });

  app.post('/api/conversation/:sessionId', (req, res) => {
    if (!Array.isArray(req.body.history)) {
      return res.status(400).json({ success: false, error: 'history must be an array' });
    }
    const data = conversations.read();
    data[req.params.sessionId] = req.body.history;
    conversations.write(data);
    return res.json({ success: true, message: 'Conversation saved' });
  });

  app.delete('/api/conversation/:sessionId', (req, res) => {
    const data = conversations.read();
    delete data[req.params.sessionId];
    conversations.write(data);
    res.json({ success: true, message: 'Conversation cleared' });
  });

  app.post('/api/mood', (req, res) => {
    const { mood_score, notes, user_id, session_id } = req.body;
    const score = Number(mood_score);
    const key = getMoodKey(user_id, session_id);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ success: false, error: 'mood_score must be an integer from 1-5' });
    }
    if (!key) {
      return res.status(400).json({ success: false, error: 'user_id or session_id is required' });
    }

    const data = moods.read();
    const entries = data[key] || [];
    const today = getTodayDate(now());
    const entry = { date: today, mood_score: score, notes: notes || '', timestamp: now().toISOString() };
    const existingIndex = entries.findIndex((mood) => mood.date === today);
    if (existingIndex >= 0) entries[existingIndex] = entry;
    else entries.push(entry);
    data[key] = entries;
    moods.write(data);
    return res.json({ success: true, message: 'Mood saved', mood: entry });
  });

  app.get('/api/mood/today', (req, res) => {
    const key = getMoodKey(req.query.userId, req.query.sessionId);
    if (!key) return res.status(400).json({ success: false, error: 'userId or sessionId is required' });
    const mood = moods.read()[key]?.find((entry) => entry.date === getTodayDate(now())) || null;
    return res.json({ mood });
  });

  app.get('/api/mood/weekly', (req, res) => {
    const key = getMoodKey(req.query.userId, req.query.sessionId);
    if (!key) return res.status(400).json({ success: false, error: 'userId or sessionId is required' });
    return res.json(getWeeklyAnalysis(moods.read()[key] || [], now()));
  });

  app.get('/api/mood/monthly', (req, res) => {
    const key = getMoodKey(req.query.userId, req.query.sessionId);
    if (!key) return res.status(400).json({ success: false, error: 'userId or sessionId is required' });
    return res.json(getMonthlyAnalysis(moods.read()[key] || [], now()));
  });

  app.get('/api/profile/:userId', (req, res) => {
    res.json({ success: true, profile: profiles.read()[req.params.userId] || null });
  });

  app.post('/api/profile', (req, res) => {
    const { user_id, display_name, bio, location, website, avatar_url } = req.body;
    if (!user_id) return res.status(400).json({ success: false, error: 'user_id is required' });
    const data = profiles.read();
    const profile = {
      user_id,
      display_name: display_name || '',
      bio: bio || '',
      location: location || '',
      website: website || '',
      avatar_url: avatar_url || '',
      created_at: data[user_id]?.created_at || now().toISOString(),
      updated_at: now().toISOString(),
    };
    data[user_id] = profile;
    profiles.write(data);
    return res.json({ success: true, profile });
  });

  if (options.serveStatic !== false) {
    const reactBuildPath = path.join(rootDir, 'react-app', 'build');
    app.use(express.static(reactBuildPath));
    app.get('/mindful_chat.html', (_req, res) => res.sendFile(path.join(rootDir, 'mindful_chat.html')));
    app.get('*', (_req, res) => res.sendFile(path.join(reactBuildPath, 'index.html')));
  }

  return app;
}

module.exports = { createApp };
