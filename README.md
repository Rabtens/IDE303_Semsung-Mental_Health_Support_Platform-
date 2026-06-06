# MindfulChat — Setup & Run Instructions

A compassionate mental health support chatbot with persistent conversation storage.

## Features

- 💬 Real-time chat with Groq LLM (`llama-3.3-70b`)
- 💾 **Persistent conversations** — chats saved to backend even after page refresh
- 🗑️ **Clear conversation** — one-click history reset button in header
- 🆘 **Crisis detection** — auto-flags sensitive topics with helpline info
- 🎨 **Calming UI** — sage green + warm cream minimal design

## Prerequisites

- **Node.js** (v14+) — [Download](https://nodejs.org/)
- **Groq API Key** — Get free at [console.groq.com](https://console.groq.com)

## Installation & Run

### 1. Install dependencies
```bash
npm install
```
This installs `express` and `cors` from `package.json`.

### 2. Start the backend server
```bash
npm start
```
Expected output:
```
🌿 MindfulChat server running at http://localhost:3000
```

### 3. Open in browser
Navigate to: **http://localhost:3000**

---

## How It Works

### **Frontend** (`mindful_chat.html`)
- Loads saved conversation on page load (via session ID stored in localStorage)
- Saves conversation to backend **after each message**
- Clear button (🗑️ in header) wipes history locally and on server

### **Backend** (`server.js`)
- Stores all conversations in `conversations.json` (file-based)
- Endpoints:
  - `GET /api/conversation/:sessionId` — retrieve saved chat
  - `POST /api/conversation/:sessionId` — save/update chat
  - `DELETE /api/conversation/:sessionId` — clear a session's history

---

## Groq API Key

The API key is already embedded in `mindful_chat.html` (line 401):
```javascript
let GROQ_API_KEY = 'REDACTED_GROQ_KEY';
```

**⚠️ Security Note:** For production, move the key to a `.env` file or backend environment variable to avoid exposing it in the client code.

---

## Optional: Development Mode

For auto-restart on file changes:
```bash
npm run dev
```
(Requires `nodemon` — already listed in `devDependencies`)

---

## File Structure
```
mhsp/
├── mindful_chat.html      # Frontend (UI + client-side logic)
├── server.js              # Backend (Express + file storage)
├── package.json           # Node dependencies
├── conversations.json     # Chat history storage (auto-created)
└── README.md              # This file
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 3000 already in use | Change `PORT` in `server.js` or kill the process using port 3000 |
| Conversation not saving | Check browser console (F12) for network errors; ensure server is running |
| "API key is missing" | Verify `GROQ_API_KEY` is set in `mindful_chat.html` line 401 |

---

## Next Steps (Optional)

- **Deploy to cloud:** Use Vercel, Heroku, or Railway for free hosting
- **Use MongoDB:** Replace `conversations.json` with MongoDB Atlas for scalability
- **Add authentication:** Secure conversations per user with login
- **Move API key to env:** Use `dotenv` for environment variables

---

**Questions?** Check the code comments marked with `───` for detailed explanations.
# IDE303_Semsung-Mental_Health_Support_Platform-
