const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build
const reactBuildPath = path.join(__dirname, 'react-app', 'build');
app.use(express.static(reactBuildPath));

// Serve static files (your HTML/assets)
app.use(express.static(__dirname));

// File to store conversations
const conversationsFile = path.join(__dirname, 'conversations.json');

// Initialize conversations file if it doesn't exist
if (!fs.existsSync(conversationsFile)) {
  fs.writeFileSync(conversationsFile, JSON.stringify({}));
}

// Helper: read all conversations
function readConversations() {
  try {
    return JSON.parse(fs.readFileSync(conversationsFile, 'utf-8'));
  } catch {
    return {};
  }
}

// Helper: write conversations
function writeConversations(data) {
  fs.writeFileSync(conversationsFile, JSON.stringify(data, null, 2));
}

// API endpoints for conversations
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversations = readConversations();
  
  if (conversations[sessionId]) {
    res.json({ success: true, history: conversations[sessionId] });
  } else {
    res.json({ success: true, history: [] });
  }
});

app.post('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { history } = req.body;

  if (!Array.isArray(history)) {
    return res.status(400).json({ success: false, error: 'history must be an array' });
  }

  const conversations = readConversations();
  conversations[sessionId] = history;
  writeConversations(conversations);

  res.json({ success: true, message: 'Conversation saved' });
});

app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversations = readConversations();
  
  delete conversations[sessionId];
  writeConversations(conversations);

  res.json({ success: true, message: 'Conversation cleared' });
});

// ==================== MOOD TRACKING API ====================

// File to store moods
const moodsFile = path.join(__dirname, 'moods.json');

// Initialize moods file if it doesn't exist
if (!fs.existsSync(moodsFile)) {
  fs.writeFileSync(moodsFile, JSON.stringify({}));
}

// Helper: read all moods
function readMoods() {
  try {
    return JSON.parse(fs.readFileSync(moodsFile, 'utf-8'));
  } catch {
    return {};
  }
}

// Helper: write moods
function writeMoods(data) {
  fs.writeFileSync(moodsFile, JSON.stringify(data, null, 2));
}

// Helper: get unique key for user/session
function getMoodKey(userId, sessionId) {
  return userId || sessionId;
}

// Helper: get today's date as YYYY-MM-DD
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// POST: Submit mood entry
app.post('/api/mood', (req, res) => {
  const { mood_score, notes, user_id, session_id } = req.body;

  if (!mood_score || (mood_score < 1 || mood_score > 5)) {
    return res.status(400).json({ success: false, error: 'mood_score must be 1-5' });
  }

  const key = getMoodKey(user_id, session_id);
  const moods = readMoods();

  if (!moods[key]) {
    moods[key] = [];
  }

  // Check if mood already exists for today
  const today = getTodayDate();
  const todayIndex = moods[key].findIndex(m => m.date === today);

  const moodEntry = {
    date: today,
    mood_score: parseInt(mood_score),
    notes: notes || '',
    timestamp: new Date().toISOString()
  };

  if (todayIndex >= 0) {
    moods[key][todayIndex] = moodEntry;
  } else {
    moods[key].push(moodEntry);
  }

  writeMoods(moods);
  res.json({ success: true, message: 'Mood saved', mood: moodEntry });
});

// GET: Today's mood
app.get('/api/mood/today', (req, res) => {
  const { userId, sessionId } = req.query;
  const key = getMoodKey(userId, sessionId);
  const moods = readMoods();
  const today = getTodayDate();

  const mood = moods[key]?.find(m => m.date === today);
  res.json(mood ? { mood } : { mood: null });
});

// GET: Weekly analysis
app.get('/api/mood/weekly', (req, res) => {
  const { userId, sessionId } = req.query;
  const key = getMoodKey(userId, sessionId);
  const moods = readMoods();
  const moodEntries = moods[key] || [];

  // Get last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weekMoods = moodEntries.filter(m => {
    const moodDate = new Date(m.date);
    return moodDate >= sevenDaysAgo && moodDate <= today;
  });

  if (weekMoods.length === 0) {
    return res.json({
      average_mood: 0,
      best_day: '-',
      worst_day: '-',
      total_entries: 0,
      daily_moods: []
    });
  }

  const average = (weekMoods.reduce((sum, m) => sum + m.mood_score, 0) / weekMoods.length).toFixed(1);
  const bestDay = weekMoods.reduce((prev, current) => current.mood_score > prev.mood_score ? current : prev);
  const worstDay = weekMoods.reduce((prev, current) => current.mood_score < prev.mood_score ? current : prev);

  // Create daily breakdown
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMoods = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayMood = weekMoods.find(m => m.date === dateStr);
    dailyMoods.push({
      day: dayNames[date.getDay()],
      mood: dayMood?.mood_score || 0
    });
  }

  res.json({
    average_mood: parseFloat(average),
    best_day: new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short' }),
    worst_day: new Date(worstDay.date).toLocaleDateString('en-US', { weekday: 'short' }),
    total_entries: weekMoods.length,
    daily_moods: dailyMoods
  });
});

// GET: Monthly analysis
app.get('/api/mood/monthly', (req, res) => {
  const { userId, sessionId } = req.query;
  const key = getMoodKey(userId, sessionId);
  const moods = readMoods();
  const moodEntries = moods[key] || [];

  // Get last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const monthMoods = moodEntries.filter(m => {
    const moodDate = new Date(m.date);
    return moodDate >= thirtyDaysAgo && moodDate <= today;
  });

  if (monthMoods.length === 0) {
    return res.json({
      monthly_average: 0,
      best_week: '-',
      current_streak: 0,
      total_entries: 0,
      insight: 'Start logging your mood daily to see monthly insights!',
      weekly_averages: []
    });
  }

  // Calculate monthly average
  const monthlyAverage = (monthMoods.reduce((sum, m) => sum + m.mood_score, 0) / monthMoods.length).toFixed(1);

  // Calculate weekly averages
  const weeklyAverages = [];
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(thirtyDaysAgo);
    weekStart.setDate(weekStart.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekMoods = monthMoods.filter(m => {
      const moodDate = new Date(m.date);
      return moodDate >= weekStart && moodDate <= weekEnd;
    });

    if (weekMoods.length > 0) {
      const avg = weekMoods.reduce((sum, m) => sum + m.mood_score, 0) / weekMoods.length;
      weeklyAverages.push({ week: week + 1, average: parseFloat(avg.toFixed(1)) });
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  const sortedMoods = [...monthMoods].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (let i = 0; i < sortedMoods.length; i++) {
    const moodDate = new Date(sortedMoods[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    const moodDateStr = moodDate.toISOString().split('T')[0];
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (moodDateStr === expectedDateStr) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Generate insight
  let insight = '';
  if (monthlyAverage >= 4) {
    insight = '🌟 You\'re having a great month! Keep up this positive momentum.';
  } else if (monthlyAverage >= 3) {
    insight = '😊 Your mood is stable this month. That\'s good consistency!';
  } else if (monthlyAverage >= 2) {
    insight = '💪 You\'re going through some challenges. Remember to practice self-care.';
  } else {
    insight = '🤝 Reach out to someone you trust. You don\'t have to go through this alone.';
  }

  res.json({
    monthly_average: parseFloat(monthlyAverage),
    best_week: weeklyAverages.length > 0 ? Math.max(...weeklyAverages.map(w => w.average)) : '-',
    current_streak: currentStreak,
    total_entries: monthMoods.length,
    insight,
    weekly_averages: weeklyAverages
  });
});

// ====================================================

// ==================== USER PROFILES API ====================

// File to store user profiles
const profilesFile = path.join(__dirname, 'profiles.json');

// Initialize profiles file if it doesn't exist
if (!fs.existsSync(profilesFile)) {
  fs.writeFileSync(profilesFile, JSON.stringify({}));
}

// Helper: read all profiles
function readProfiles() {
  try {
    return JSON.parse(fs.readFileSync(profilesFile, 'utf-8'));
  } catch {
    return {};
  }
}

// Helper: write profiles
function writeProfiles(data) {
  fs.writeFileSync(profilesFile, JSON.stringify(data, null, 2));
}

// GET: Get user profile
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const profiles = readProfiles();
  const profile = profiles[userId];

  if (profile) {
    res.json({ success: true, profile });
  } else {
    res.json({ success: true, profile: null });
  }
});

// POST: Create or update user profile
app.post('/api/profile', (req, res) => {
  const { user_id, display_name, bio, location, website, avatar_url } = req.body;

  if (!user_id) {
    return res.status(400).json({ success: false, error: 'user_id is required' });
  }

  const profiles = readProfiles();
  
  const profile = {
    user_id,
    display_name: display_name || '',
    bio: bio || '',
    location: location || '',
    website: website || '',
    avatar_url: avatar_url || '',
    created_at: profiles[user_id]?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  profiles[user_id] = profile;
  writeProfiles(profiles);

  res.json({ success: true, profile });
});

// ====================================================

// Serve mindful_chat.html directly
app.get('/mindful_chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mindful_chat.html'));
});

// Fallback to React index for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌿 MindfulChat server running at http://localhost:${PORT}`);
});
