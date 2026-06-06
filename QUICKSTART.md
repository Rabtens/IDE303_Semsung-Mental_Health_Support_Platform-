# 🚀 MindfulChat — Complete Setup Guide

A full-stack mental health platform with React frontend, Node.js backend, Groq AI chatbot, Supabase authentication, and voice assistant.

## 📦 What's New

✅ **Supabase Authentication** — Three access modes (Public, Anonymous, Registered)  
✅ **Sign Up / Sign In Pages** — Beautiful auth interface  
✅ **User Profiles** — Save conversations per user  
✅ **Access Mode Selection** — Choose how to use the platform  
✅ **Protected Routes** — Different features for each access mode  

---

## 🎯 Access Modes

| Mode | Features | Best For |
|------|----------|----------|
| **Public** 🌐 | Browse landing page | Exploring the platform |
| **Anonymous** 🔒 | Chat with temp session ID | Quick chat without account |
| **Registered** 👤 | Full account + history | Returning users |

---

## ⚡ Quick Start

### 1️⃣ Install Dependencies

```bash
cd ~/Desktop/mhsp
npm install                    # Backend deps
cd react-app
npm install                    # React + Supabase
cd ..
```

### 2️⃣ Configure Supabase (Required for Auth)

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to:
- Create a free Supabase project
- Get API keys
- Create `.env.local` with credentials

### 3️⃣ Build React App

```bash
cd react-app
npm run build
cd ..
```

### 4️⃣ Start Server

```bash
node server-react.js
```

Expected output:
```
🌿 MindfulChat server running at http://localhost:3000
```

### 5️⃣ Visit in Browser

Open: **http://localhost:3000**

You'll see the **Auth Choice page** → Select access mode → Explore!

---

## 📁 New File Structure

```
mhsp/
├── react-app/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js         # ← Supabase auth logic
│   │   ├── pages/
│   │   │   ├── AuthChoice.js          # ← Choose access mode
│   │   │   ├── SignIn.js              # ← Login
│   │   │   ├── SignUp.js              # ← Register
│   │   │   ├── LandingPage.js
│   │   │   └── ChatPage.js
│   │   └── ...
│   ├── .env.example                   # ← Copy to .env.local
│   └── package.json (updated)
├── SUPABASE_SETUP.md                  # ← Auth configuration guide
├── server-react.js
├── mindful_chat.html
└── ...
```

---

## 🔑 Key Features

### Authentication (Supabase)
- ✅ Email/password sign up
- ✅ Email confirmation
- ✅ Sign in / sign out
- ✅ Access mode tracking
- ✅ Session management

### UI Pages
- ✅ Auth Choice (3 options)
- ✅ Sign Up with validation
- ✅ Sign In with error handling
- ✅ User info in header
- ✅ Responsive design

### Chatbot Integration
- ✅ Works with all 3 access modes
- ✅ Session ID tracking
- ✅ Conversation persistence
- ✅ Voice assistant (🔊)
- ✅ Clear history button

---

## 🔐 Security Notes

1. **Supabase Keys** → Store in `.env.local` (not in git)
2. **Row Level Security** → Enabled for database tables
3. **Groq API Key** → Embedded in `mindful_chat.html` (use env var in production)
4. **Conversations** → Encrypted, private per user

---

## 📖 Configuration Files

### `.env.local` (Create this)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

---

## 🚀 Development Workflow

### Edit React Components
```bash
cd react-app
npm start  # Hot-reload dev server on :3000
```

### Edit Chatbot
```bash
# Modify mindful_chat.html
# Refresh browser to see changes
```

### Edit Backend
```bash
# Modify server-react.js
# Restart: npm install && node server-react.js
```

---

## 📱 Routes & Pages

| Route | Page | Access |
|-------|------|--------|
| `/auth-choice` | Choose access mode | Everyone |
| `/signup` | Create account | Not logged in |
| `/signin` | Login | Not logged in |
| `/` | Landing page | Everyone |
| `/chat` | Chatbot | Everyone (mode-specific) |

---

## 🎨 Design System

All pages use consistent **Sage/Cream theme**:
- `--sage-dark: #3d5c42` (Dark green)
- `--sage: #6b8f71` (Green)
- `--cream: #f7f4ee` (Off-white)
- `--warm: #ede8df` (Beige)

---

## 🧪 Testing Checklist

- [ ] Can see Auth Choice on first visit
- [ ] Public mode accesses landing page
- [ ] Anonymous mode enables chat without signup
- [ ] Can sign up with email
- [ ] Can sign in after signup
- [ ] User email shows in header when logged in
- [ ] Sign out clears session
- [ ] Chatbot saves conversations per access mode
- [ ] Voice button works (🔊)
- [ ] Mobile layout is responsive

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| "Cannot find module @supabase" | Run `npm install @supabase/supabase-js` in react-app |
| Auth pages blank | Check `.env.local` exists with valid Supabase keys |
| Conversations not saving | Verify backend is running: `node server-react.js` |
| Port 3000 in use | Kill old process: `pkill -f "node server"` |

---

## 📚 Next Steps (Optional)

- [ ] Deploy to Vercel (frontend) + Heroku (backend)
- [ ] Add user profile management
- [ ] Store conversations in Supabase database
- [ ] Add export chat as PDF
- [ ] Email notifications for crisis detection
- [ ] Analytics dashboard
- [ ] Dark mode toggle

---

## 📞 Support

For issues:
1. Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for auth problems
2. Check [SETUP_REACT.md](SETUP_REACT.md) for React setup
3. Verify `.env.local` has correct Supabase keys
4. Check browser console (F12) for errors

---

**Made with 💚 for mental health.**

Questions? Reach out or check the detailed setup guides!
