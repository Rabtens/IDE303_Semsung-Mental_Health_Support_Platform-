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
Install the React dependencies and build the frontend too:
```bash
cd react-app
npm install
npm run build
cd ..
```

### 2. Configure the backend
Copy `.env.example` to `.env` and set:
```bash
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Start the backend server
```bash
npm start
```
Expected output:
```
🌿 MindfulChat server running at http://localhost:3000
```

### 4. Open in browser
Navigate to: **http://localhost:3000**

---

## How It Works

### **Frontend** (`mindful_chat.html`)
- Loads saved conversation on page load (via session ID stored in localStorage)
- Saves conversation to backend **after each message**
- Clear button (🗑️ in header) wipes history locally and on server

### **Backend** (`server-react.js`)
- Stores all conversations in `conversations.json` (file-based)
- Endpoints:
  - `POST /api/chat` — securely proxy chatbot requests to Groq
  - `GET /api/conversation/:sessionId` — retrieve saved chat
  - `POST /api/conversation/:sessionId` — save/update chat
  - `DELETE /api/conversation/:sessionId` — clear a session's history

---

## Groq API Key

Get a free key at [console.groq.com](https://console.groq.com), then set
`GROQ_API_KEY` in the backend `.env` file. The browser calls `/api/chat`; never
put the Groq key in React environment variables or browser `localStorage`.

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
├── server-react.js        # Backend startup
├── app.js                 # Testable Express application
├── package.json           # Node dependencies
├── conversations.json     # Chat history storage (auto-created)
└── README.md              # This file
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 3000 already in use | Change `PORT` in `.env` or stop the existing process |
| Conversation not saving | Check browser console (F12) for network errors; ensure server is running |
| Chat service is not configured | Verify server-side `GROQ_API_KEY` is set in `.env` |

---

## Next Steps (Optional)

- **Deploy to cloud:** Use Vercel, Heroku, or Railway for free hosting
- **Use MongoDB:** Replace `conversations.json` with MongoDB Atlas for scalability
- **Add authentication:** Secure conversations per user with login
- **Add authorization:** Verify Supabase access tokens on private API endpoints

---

**Questions?** Check the code comments marked with `───` for detailed explanations.
# IDE303_Semsung-Mental_Health_Support_Platform-
