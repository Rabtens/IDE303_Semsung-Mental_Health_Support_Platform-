# MindfulChat — Complete Platform (React + Node.js Backend)

A full-stack mental health support platform with a React landing website, embedded chatbot, persistent conversations, and voice assistant.

## 🌿 What's Included

- **React Website** — Beautiful landing page with hero, features, about, testimonials, resources
- **Chatbot** — AI-powered mental health companion (Groq LLM) with voice assistant
- **Voice Assistant** — Text-to-speech for all bot responses
- **Persistent Storage** — Conversations saved server-side with session IDs
- **Crisis Support** — Auto-detection of crisis keywords + hotline info
- **Responsive Design** — Works on mobile, tablet, desktop

---

## 📁 Project Structure

```
mhsp/
├── index.html              # Legacy landing page (HTML only)
├── mindful_chat.html       # Chatbot with voice & persistence
├── server.js               # Original backend (file-based storage)
├── server-react.js         # New backend (serves React build)
├── package.json            # Backend dependencies
├── conversations.json      # Auto-created conversation storage
├── react-app/              # React website (NEW)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Header, Footer, Hero, Features, etc.
│   │   ├── pages/          # LandingPage, ChatPage
│   │   ├── App.js          # Main app with routing
│   │   └── App.css         # Global styles
│   ├── build/              # Production build (after npm run build)
│   ├── package.json
│   └── README.md
└── README.md (this file)
```

---

## 🚀 Quick Start

### Option A: React Website (Recommended)

**Step 1: Install all dependencies**
```bash
cd /path/to/mhsp
npm install                    # Backend deps
cd react-app
npm install                    # React deps
cd ..
```

**Step 2: Build React**
```bash
cd react-app
npm run build
cd ..
```

**Step 3: Start the server**
```bash
node server-react.js
```

**Step 4: Open browser**
Visit: **http://localhost:3000**

---

### Option B: Plain HTML Website (Legacy)

If you don't need React:
```bash
npm install
npm start
# Visit http://localhost:3000
```

---

## 🎨 Features

### Landing Page (React)
- ✅ Hero section with dual CTAs
- ✅ 6 feature cards (24/7, Voice, Privacy, etc.)
- ✅ About section with mission statement
- ✅ 3 testimonials with 5-star ratings
- ✅ 6 mental health resource cards
- ✅ Final call-to-action section
- ✅ Sticky navigation header
- ✅ Professional footer

### Chatbot Page (/chat)
- ✅ AI responses (Groq llama-3.3-70b)
- ✅ 🔊 Voice button per message (Web Speech API)
- ✅ Play/pause/resume speech
- ✅ Conversation persistence (saves to backend)
- ✅ 🗑️ Clear history button
- ✅ Crisis detection with hotline info
- ✅ Evidence-based techniques (CBT, grounding, mindfulness)
- ✅ Typing indicator

---

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router v6
- HTML5 / CSS3
- Web Speech API (voice)

**Backend:**
- Node.js
- Express.js
- CORS
- File-based JSON storage

**AI:**
- Groq LLM (llama-3.3-70b-versatile)

---

## 📖 Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Marketing website with all sections |
| `/chat` | Chat | Embedded chatbot interface |

---

## 🔐 Security Notes

1. **Groq API Key** — Currently hardcoded in `mindful_chat.html`
   - For production, move to environment variable
   - Never expose in client-side code

2. **Conversations** — Stored in `conversations.json` locally
   - For production, use MongoDB/PostgreSQL
   - Add user authentication

3. **Privacy** — Conversations stored per session ID (localStorage)
   - Users can clear their history anytime

---

## 📝 Environment Setup

### Requirements
- Node.js v14+ (Download: nodejs.org)
- npm (comes with Node.js)
- Groq API Key (Free: console.groq.com)

### First Time Setup
```bash
# 1. Navigate to project
cd ~/Desktop/mhsp

# 2. Install all dependencies
npm install
cd react-app && npm install && cd ..

# 3. Build React
cd react-app && npm run build && cd ..

# 4. Start server
node server-react.js

# 5. Open browser
# Visit http://localhost:3000
```

---

## 🎯 Development Workflow

### Edit React Components
```bash
cd react-app
npm start  # Hot-reload dev server
```
(Runs on separate port with auto-refresh)

### Edit Chatbot
```bash
# Edit mindful_chat.html directly
# Refresh browser to see changes
```

### Edit Backend
```bash
# Edit server-react.js
# Restart: npm install && node server-react.js
```

---

## 📦 Production Deployment

### Build steps:
1. Build React: `cd react-app && npm run build && cd ..`
2. Deploy to Vercel/Heroku/Railway
3. Set environment variables (GROQ_API_KEY, etc.)
4. Use production database (MongoDB Atlas recommended)

### Platforms:
- **Vercel** — Best for React frontend
- **Heroku** — For full-stack (frontend + backend)
- **Railway** — Simple, modern deployment

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Landing page loads & all sections visible
- [ ] Navigation scrolls to sections
- [ ] "Start Chatting" button navigates to `/chat`
- [ ] Chatbot loads and accepts messages
- [ ] Voice button plays audio
- [ ] Messages persist after refresh
- [ ] Clear button wipes history
- [ ] Crisis keywords trigger hotline banner
- [ ] Mobile layout is responsive

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page on `/` | Run `npm run build` in react-app folder |
| Chatbot not loading | Check `mindful_chat.html` exists in root |
| API key missing error | Verify key in mindful_chat.html line ~401 |
| Port 3000 in use | Change PORT in server-react.js |
| CSS not loading | Clear browser cache (Ctrl+Shift+Delete) |

---

## 📚 Further Reading

- [React Router Docs](https://reactrouter.com/)
- [Express.js Guide](https://expressjs.com/)
- [Groq API Docs](https://console.groq.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 📄 License & Disclaimer

**Disclaimer:** MindfulChat provides emotional support and general wellness guidance. It is NOT a substitute for professional mental health care. If you're in crisis:
- 🇺🇸 Call **988** (Suicide & Crisis Lifeline)
- 🌍 Visit **findahelpline.com** for international resources

---

**Made with 💚 for mental health.**

Questions? Check the README files in individual folders for more details.
