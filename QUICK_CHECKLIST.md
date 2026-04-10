# 🚀 Quick Setup Checklist

Print this or keep it open while you set up!

---

## ☐ Step 1: Supabase Setup (5 minutes)

### Get Your Credentials
- [ ] Go to https://supabase.com/dashboard
- [ ] Click your project
- [ ] Click ⚙️ **Settings** → **API**
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **anon public key** (starts with `eyJ...`)
- [ ] Copy **service_role secret key** (starts with `eyJ...`)

### Verify Storage
- [ ] Click **Storage** in sidebar
- [ ] Confirm bucket name is: `incident-attachments`
- [ ] Confirm bucket is **Public**

**✅ Done? Move to Step 2**

---

## ☐ Step 2: Google Gemini Setup (2 minutes)

- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Sign in with Google account
- [ ] Click **"Get API key"** or **"Create API key"**
- [ ] Select **"Create API key in new project"**
- [ ] Copy the key (starts with `AIza...`)
- [ ] Save it somewhere safe!
- [ ] **Note**: No credit card needed! Free tier included.

**✅ Done? Move to Step 3**

---

## ☐ Step 3: Install Docker (10 minutes)

- [ ] Go to https://www.docker.com/products/docker-desktop/
- [ ] Download Docker Desktop for Windows
- [ ] Run installer
- [ ] Restart computer when prompted
- [ ] Wait for Docker Desktop to start
- [ ] Open Command Prompt (Win+R, type `cmd`)
- [ ] Type: `docker --version`
- [ ] Verify you see version number

**✅ Done? Move to Step 4**

---

## ☐ Step 4: Configure Backend (5 minutes)

- [ ] Open File Explorer (Win+E)
- [ ] Go to: `C:\Users\User\Documents\incident-handoff\backend`
- [ ] Copy `.env.example` file
- [ ] Rename copy to: `.env`
- [ ] Open `.env` with Notepad
- [ ] Fill in these values:

```
SUPABASE_URL=https://xxxxx.supabase.co          ← Your Project URL
SUPABASE_ANON_KEY=eyJ...                        ← Your anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...                ← Your service_role key
OPENAI_API_KEY=sk-proj-...                      ← Your OpenAI key
SECRET_KEY=make-this-random-and-long-12345      ← Any random string
```

- [ ] Keep these lines unchanged:
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/incident_handoff
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

- [ ] Save file (Ctrl+S)
- [ ] Close Notepad

**✅ Done? Move to Step 5**

---

## ☐ Step 5: Configure Frontend (3 minutes)

- [ ] Go to: `C:\Users\User\Documents\incident-handoff\frontend`
- [ ] Copy `.env.example` file
- [ ] Rename copy to: `.env`
- [ ] Open `.env` with Notepad
- [ ] Fill in these values:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co     ← Same as backend
VITE_SUPABASE_ANON_KEY=eyJ...                   ← Same as backend
VITE_API_BASE_URL=http://localhost:8000/api     ← Keep as-is
```

- [ ] Save file (Ctrl+S)
- [ ] Close Notepad

**✅ Done? Move to Step 6**

---

## ☐ Step 6: Start Application (5 minutes)

- [ ] Open Command Prompt (Win+R, type `cmd`)
- [ ] Type: `cd "C:\Users\User\Documents\incident-handoff"`
- [ ] Press Enter
- [ ] Type: `docker-compose up -d`
- [ ] Press Enter
- [ ] Wait for downloads (first time: 5-10 minutes)
- [ ] Wait for "Created" messages
- [ ] Type: `docker-compose ps`
- [ ] Verify all 5 services show "Up"

**✅ Done? Move to Step 7**

---

## ☐ Step 7: Setup Database (1 minute)

- [ ] In Command Prompt, type: `docker-compose exec backend alembic upgrade head`
- [ ] Press Enter
- [ ] Wait for "INFO" messages
- [ ] Verify no errors

**✅ Done? Move to Step 8**

---

## ☐ Step 8: Create User & Test (5 minutes)

- [ ] Open browser
- [ ] Go to: http://localhost:3000
- [ ] Click **Sign Up**
- [ ] Enter email and password
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Go back to http://localhost:3000
- [ ] Log in
- [ ] You should see the Dashboard!

**✅ Done? Move to Step 9**

---

## ☐ Step 9: Create Test Incident (3 minutes)

- [ ] Click **New Incident** button
- [ ] Fill in:
  - Title: "Test Incident"
  - Description: "Testing the system"
  - Severity: SEV2
- [ ] Click **Create**
- [ ] You're in the incident workspace!

**✅ Done? Move to Step 10**

---

## ☐ Step 10: Test All Features (5 minutes)

### Timeline
- [ ] Click **Timeline** tab
- [ ] Click **Add Event**
- [ ] Type: "First timeline event"
- [ ] Click **Add**
- [ ] Event appears!

### Comments
- [ ] Click **Comments** tab
- [ ] Type: "First comment"
- [ ] Click **Post**
- [ ] Comment appears!

### Attachments
- [ ] Click **Attachments** tab
- [ ] Click **Upload File**
- [ ] Choose any file (max 10MB)
- [ ] File uploads!

### AI Summary
- [ ] Click **AI Summary** tab
- [ ] Click **Generate Summary**
- [ ] Wait 5-10 seconds
- [ ] AI summary appears!
- [ ] Click **Approve**

**✅ ALL DONE! 🎉**

---

## 📊 Quick Reference

### URLs
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Commands
```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Restart a service
docker-compose restart backend
```

### File Locations
- Backend config: `backend/.env`
- Frontend config: `frontend/.env`
- Project root: `C:\Users\User\Documents\incident-handoff`

---

## 🐛 Quick Troubleshooting

### Nothing works?
```bash
docker-compose down
docker-compose up -d
docker-compose ps
```

### Can't access localhost:3000?
```bash
docker-compose logs frontend
docker-compose restart frontend
```

### AI summary fails?
- Check Gemini API key in `backend/.env`
- Verify key: https://aistudio.google.com/app/apikey
- Check logs: `docker-compose logs celery_worker`

### Login fails?
- Check email for verification link
- Verify Supabase credentials in both `.env` files
- Check Supabase project is active

---

## ✅ Success Indicators

You know it's working when:
- ✅ All 5 services show "Up" in `docker-compose ps`
- ✅ http://localhost:3000 shows login page
- ✅ http://localhost:8000/docs shows API documentation
- ✅ You can log in and see the dashboard
- ✅ You can create an incident
- ✅ AI summary generates successfully

---

## 📞 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify services: `docker-compose ps`
3. Check `.env` files for typos
4. Restart: `docker-compose down && docker-compose up -d`
5. Read `SETUP_GUIDE.md` for detailed explanations

---

**Print this checklist and check off items as you complete them!**
