const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (your HTML)
app.use(express.static(__dirname));

// Serve mindful_chat.html as default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

// GET /api/conversation/:sessionId - retrieve a user's conversation
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversations = readConversations();
  
  if (conversations[sessionId]) {
    res.json({ success: true, history: conversations[sessionId] });
  } else {
    res.json({ success: true, history: [] });
  }
});

// POST /api/conversation/:sessionId - save or update a conversation
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

// DELETE /api/conversation/:sessionId - clear a conversation
app.delete('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversations = readConversations();
  
  delete conversations[sessionId];
  writeConversations(conversations);

  res.json({ success: true, message: 'Conversation cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌿 MindfulChat server running at http://localhost:${PORT}`);
});
