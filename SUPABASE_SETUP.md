# Supabase Authentication Setup

This guide will help you integrate Supabase authentication with MindfulChat.

## 🔐 Overview

MindfulChat now supports three access modes:
1. **Public** — Browse without any account or tracking
2. **Anonymous** — Chat with a temporary session ID (no account needed)
3. **Registered** — Create an account for permanent chat history

## 📋 Prerequisites

- Supabase account (free at [supabase.com](https://supabase.com))
- React app set up locally

---

## ⚙️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project name:** mindful-chat
   - **Database password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
5. Click **"Create new project"** and wait for setup (~2 min)

---

## 🔑 Step 2: Get API Keys

Once your project is created:

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **Anon Key** → `REACT_APP_SUPABASE_ANON_KEY`

---

## 🔧 Step 3: Configure Environment Variables

1. In `/react-app`, create `.env.local`:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Never commit** `.env.local` (it's in `.gitignore` by default)

---

## 🗄️ Step 4: Create Database Tables (Optional)

For user chat history, create a table in Supabase:

### User Profiles Table
```sql
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Chat History Table
```sql
create table public.chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  session_id text,
  messages jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Set Row Level Security (RLS)
```sql
alter table user_profiles enable row level security;
alter table chat_history enable row level security;

create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can read own chat history"
  on chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat history"
  on chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat history"
  on chat_history for update
  using (auth.uid() = user_id);
```

---

## 🎯 Step 5: Test Authentication

1. Start the React app:
```bash
cd react-app
npm install  # Install new @supabase/supabase-js dependency
npm start
```

2. Visit **http://localhost:3000**

3. You should see the **Auth Choice** page with three options:
   - 🌐 Browse Publicly
   - 🔒 Chat Anonymously
   - 👤 Create Account

4. Try signing up with a test email

---

## 🛡️ Authentication Flow

### Public Mode
- Browse landing page freely
- No account needed
- No conversation tracking

### Anonymous Mode
- Access chatbot immediately
- Session ID stored in localStorage
- Conversations saved temporarily
- Can clear history anytime
- No email/password required

### Registered Mode
- Sign up with email/password
- Email verification required (check spam folder)
- Permanent chat history linked to account
- Can sign in from any device
- Access profile and settings

---

## 📝 Sign Up / Sign In Pages

The app now includes:
- `/auth-choice` — Choose access mode
- `/signin` — Sign in to existing account
- `/signup` — Create new account

All pages use Supabase Auth under the hood.

---

## 🔄 Update Chatbot Integration

The chatbot (`mindful_chat.html`) now uses session IDs that work with all three modes:

- **Public:** Unique ID per session
- **Anonymous:** Prefixed with `anon_`
- **Registered:** Linked to user account (in progress)

Conversations are persisted via the backend API.

---

## 🚀 Production Deployment

For production, update your `.env.local` to match your Supabase project:

```bash
REACT_APP_SUPABASE_URL=https://your-prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-prod-anon-key
```

Then rebuild and deploy:
```bash
npm run build
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `.env.local` matches Supabase Project Settings → API |
| Blank auth pages | Did you `npm install @supabase/supabase-js`? |
| Email not received | Check spam folder; Supabase uses plain-text confirmations by default |
| Can't sign up | Ensure database is created in Supabase (check SQL Editor) |

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase React Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Questions?** Check Supabase Discord community or revisit your `.env.local` configuration.

Made with 💚 for mental health.

---

## 🎙️ Step 5: Voice Messages Bucket (Optional)

The counsellor chat supports voice messages. Recordings are stored in
Supabase Storage so they persist beyond the browser session.

1. In Supabase, go to **Storage** → **New bucket**.
2. Name it `voice-messages`. Mark it **Public** if you want playable URLs without signing (simpler for the demo). For production, keep it private and switch to `createSignedUrl` in `uploadVoiceMessage` (see [react-app/src/pages/CounsellingPage.js](react-app/src/pages/CounsellingPage.js)).
3. Add RLS policies so authenticated users can only upload/read their own folder:

```sql
-- Allow authenticated users to upload to their own folder
create policy "Users upload own voice"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-messages'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow reading own folder
create policy "Users read own voice"
  on storage.objects for select
  using (
    bucket_id = 'voice-messages'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

If the bucket isn't configured, the chat falls back to a local-only blob URL
and shows "Saved locally only (cloud sync unavailable)" on the bubble — voice
recording still works.
