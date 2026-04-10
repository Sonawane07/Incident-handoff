# How to Fill Your .env Files

Since I cannot access your Supabase credentials directly, here's a step-by-step guide to fill them in yourself.

---

## 📋 What You Need

### 1. **Supabase Credentials** (3 values)
- Project URL
- anon/public key
- service_role key

### 2. **Gemini API Key** (1 value)
- API key from Google AI Studio

---

## 🔑 Step 1: Get Supabase Credentials

### A. Go to Your Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Click on your project
3. Click **⚙️ Settings** (gear icon in left sidebar)
4. Click **API**

### B. Copy These Values

**Project URL:**
```
Look for: "Project URL"
Example: https://abcdefghijk.supabase.co
```

**anon public key:**
```
Look for: "Project API keys" section
Find: anon | public
It's a LONG string starting with: eyJ...
Click the copy icon
```

**service_role secret key:**
```
Same section: "Project API keys"
Find: service_role | secret
Also starts with: eyJ...
Click the copy icon
⚠️ Keep this secret!
```

---

## 🤖 Step 2: Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click **"Get API key"** or **"Create API key"**
4. Select **"Create API key in new project"**
5. Copy the key (starts with `AIza...`)

---

## 📝 Step 3: Create Backend .env File

### A. Copy the Template
```bash
# In File Explorer, go to:
C:\Users\User\Documents\incident-handoff\backend

# Find: .env.example
# Right-click → Copy
# Right-click in empty space → Paste
# Rename the copy to: .env
```

### B. Fill in the Values

Open `backend\.env` with Notepad and fill in:

```env
# Application
APP_ENV=development
SECRET_KEY=change-this-to-a-random-long-string-12345
API_V1_PREFIX=/api

# Supabase - PASTE YOUR VALUES HERE
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database - KEEP AS-IS
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/incident_handoff

# Redis - KEEP AS-IS
REDIS_URL=redis://redis:6379/0

# Celery - KEEP AS-IS
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Google Gemini - PASTE YOUR KEY HERE
GEMINI_API_KEY=AIzaSyD...
GEMINI_MODEL=gemini-1.5-pro

# CORS - KEEP AS-IS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Replace:**
- `https://xxxxx.supabase.co` with YOUR Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key) with YOUR anon key
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role key) with YOUR service_role key
- `AIzaSyD...` with YOUR Gemini API key
- `change-this-to-a-random-long-string-12345` with any random string

**Save the file!**

---

## 📝 Step 4: Create Frontend .env File

### A. Copy the Template
```bash
# In File Explorer, go to:
C:\Users\User\Documents\incident-handoff\frontend

# Find: .env.example
# Right-click → Copy
# Right-click in empty space → Paste
# Rename the copy to: .env
```

### B. Fill in the Values

Open `frontend\.env` with Notepad and fill in:

```env
# Supabase - SAME VALUES AS BACKEND
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Base URL - KEEP AS-IS
VITE_API_BASE_URL=http://localhost:8000/api
```

**Replace:**
- `https://xxxxx.supabase.co` with YOUR Project URL (SAME as backend)
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with YOUR anon key (SAME as backend)

**Save the file!**

---

## ✅ Verification Checklist

### Backend .env
- [ ] File exists at: `backend\.env`
- [ ] `SUPABASE_URL` filled in
- [ ] `SUPABASE_ANON_KEY` filled in (long string)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` filled in (long string)
- [ ] `GEMINI_API_KEY` filled in
- [ ] `SECRET_KEY` changed from default
- [ ] No extra spaces or quotes around values

### Frontend .env
- [ ] File exists at: `frontend\.env`
- [ ] `VITE_SUPABASE_URL` filled in (same as backend)
- [ ] `VITE_SUPABASE_ANON_KEY` filled in (same as backend)
- [ ] No extra spaces or quotes around values

---

## 🚀 Next Steps

After filling both `.env` files:

```bash
# Open Command Prompt
cd "C:\Users\User\Documents\incident-handoff"

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Check everything is running
docker-compose ps
```

Then visit: http://localhost:3000

---

## 🐛 Common Mistakes

### ❌ Wrong File Name
- File should be named `.env` (not `.env.txt` or `.env.example`)
- Enable "File name extensions" in File Explorer to see the real name

### ❌ Extra Quotes
```env
# WRONG
SUPABASE_URL="https://xxxxx.supabase.co"

# CORRECT
SUPABASE_URL=https://xxxxx.supabase.co
```

### ❌ Extra Spaces
```env
# WRONG
SUPABASE_URL = https://xxxxx.supabase.co

# CORRECT
SUPABASE_URL=https://xxxxx.supabase.co
```

### ❌ Incomplete Keys
- Make sure you copied the ENTIRE key
- Supabase keys are very long (200+ characters)
- Don't cut them off

### ❌ Wrong Keys
- Frontend uses `VITE_` prefix
- Backend doesn't use `VITE_` prefix
- Make sure you're editing the right file

---

## 📞 Need Help?

If you're stuck:

1. **Double-check your Supabase dashboard**
   - Settings → API
   - Make sure you're copying the right keys

2. **Verify file names**
   - Should be `.env` not `.env.example`
   - Check in File Explorer with extensions visible

3. **Check for typos**
   - No extra spaces
   - No quotes
   - Complete keys (not cut off)

4. **Test Supabase connection**
   - After starting Docker, check logs:
   ```bash
   docker-compose logs backend
   ```
   - Look for authentication errors

---

## 📋 Quick Reference

### Supabase Dashboard URLs
- **Main Dashboard**: https://supabase.com/dashboard
- **API Settings**: Click project → Settings → API
- **Storage**: Click project → Storage

### Gemini API
- **Get Key**: https://aistudio.google.com/app/apikey
- **Check Usage**: https://aistudio.google.com/app/apikey (click on your key)

### File Locations
- Backend config: `C:\Users\User\Documents\incident-handoff\backend\.env`
- Frontend config: `C:\Users\User\Documents\incident-handoff\frontend\.env`

---

**Once both files are filled in, you're ready to start the application!** 🎉
