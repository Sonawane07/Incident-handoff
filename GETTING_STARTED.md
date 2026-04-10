# Getting Started with Incident Handoff

## 🎯 What's Been Completed

### ✅ Week 0: Project Setup (Days 1-3)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Database**: 13 models with Alembic migrations
- **Authentication**: Supabase Auth (JWT)
- **Infrastructure**: Docker Compose with all services
- **Design System**: "The Serene Sentinel" theme

### ✅ Week 1: Core Incident Lifecycle (Days 4-10)
- **24 API Endpoints**:
  - Incident CRUD (create, list, update, delete)
  - Status machine (detected → acknowledged → mitigating → resolved → postmortem)
  - Timeline events (full CRUD)
  - Attachments (upload to Supabase Storage)
  - Comments (create, list, delete)
  - Role management (assign, remove, transfer commander)
  - Metrics (dashboard stats)
- **RBAC**: Commander, Responder, Viewer roles
- **Tests**: 13 pytest tests with 70%+ coverage

### ✅ Week 2: AI-Powered Summaries (Days 11-17)
- **OpenAI Integration**: GPT-4 Turbo for incident summaries
- **6 AI Endpoints**: Generate, list, edit, approve, discard
- **Celery Worker**: Async task processing
- **Frontend UI**: Full AI Summary tab with edit capabilities
- **Evidence-Based**: Analyzes timeline, comments, attachments

### 📋 Not Yet Implemented
- Week 3: Webhooks and real-time updates (SSE)
- Week 4: Testing, metrics, deployment

---

## 🚀 Quick Start Guide

### Prerequisites

Before starting, ensure you have:
- **Docker Desktop** installed and running
- **Git** installed
- **Supabase Account** (free tier works)
- **OpenAI API Key** (for AI summaries)

---

## Step 1: Clone and Setup

```bash
# Clone the repository
cd c:\Users\User\Documents\incident-handoff

# Verify you have all files
dir
```

You should see:
```
frontend/
backend/
docs/
docker-compose.yml
README.md
WEEK0_IMPLEMENTATION.md
WEEK1_IMPLEMENTATION.md
WEEK2_IMPLEMENTATION.md
GETTING_STARTED.md
```

---

## Step 2: Configure Supabase

### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign in and create a new project
3. Wait for project to be ready (~2 minutes)

### 2.2 Get Supabase Credentials
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 2.3 Configure Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `incident-attachments`
4. Make it **Public**
5. Click **Create bucket**

---

## Step 3: Configure Backend Environment

```bash
# Navigate to backend
cd backend

# Copy environment template
copy .env.example .env

# Edit .env file
notepad .env
```

**Fill in your `.env` file:**

```env
# Application
APP_ENV=development
SECRET_KEY=your-secret-key-here-change-this-in-production
API_V1_PREFIX=/api

# Supabase (PASTE YOUR VALUES HERE)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Docker will use these)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/incident_handoff

# Redis (Docker will use these)
REDIS_URL=redis://redis:6379/0

# Celery (Docker will use these)
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# OpenAI (PASTE YOUR API KEY HERE)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important Notes:**
- Replace `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` with your actual values
- Replace `OPENAI_API_KEY` with your OpenAI API key (get from https://platform.openai.com/api-keys)
- Keep `DATABASE_URL` and `REDIS_URL` as-is (Docker handles these)

---

## Step 4: Configure Frontend Environment

```bash
# Navigate to frontend
cd ..\frontend

# Copy environment template
copy .env.example .env

# Edit .env file
notepad .env
```

**Fill in your frontend `.env` file:**

```env
# Supabase (SAME VALUES AS BACKEND)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Base URL (keep as-is for Docker)
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Step 5: Start All Services with Docker

```bash
# Navigate back to project root
cd ..

# Start all services
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Cache and task queue
- **Backend** (port 8000) - FastAPI application
- **Celery Worker** - Background task processor
- **Frontend** (port 3000) - React application

**Wait for services to start (~30 seconds)**

---

## Step 6: Run Database Migrations

```bash
# Run migrations to create all tables
docker-compose exec backend alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade -> xxxxx, initial
INFO  [alembic.runtime.migration] Running upgrade xxxxx -> xxxxx, ...
```

---

## Step 7: Verify Services Are Running

### Check Service Status
```bash
docker-compose ps
```

All services should show "Up" status:
```
NAME                STATUS
postgres            Up (healthy)
redis               Up (healthy)
backend             Up
celery_worker       Up
frontend            Up
```

### Check Logs
```bash
# Backend logs
docker-compose logs backend

# Celery worker logs
docker-compose logs celery_worker

# Frontend logs
docker-compose logs frontend
```

---

## Step 8: Access the Application

### 🌐 Frontend Application
**URL**: http://localhost:3000

**What you'll see:**
- Login/Signup page
- Dashboard (after login)
- Incident list
- Incident workspace with tabs

### 📚 Backend API Documentation
**Swagger UI**: http://localhost:8000/docs
**ReDoc**: http://localhost:8000/redoc

**Available endpoints:**
- `/api/health` - Health check
- `/api/users/*` - User management
- `/api/incidents/*` - Incident CRUD
- `/api/incidents/{id}/status` - Status changes
- `/api/incidents/{id}/timeline` - Timeline events
- `/api/incidents/{id}/attachments` - File uploads
- `/api/incidents/{id}/comments` - Comments
- `/api/incidents/{id}/roles` - Team management
- `/api/incidents/{id}/ai-summary` - AI summaries
- `/api/metrics` - Dashboard metrics

---

## Step 9: Create Your First User

### Option 1: Via Frontend (Recommended)
1. Go to http://localhost:3000
2. Click **Sign Up**
3. Enter email and password
4. Check your email for verification link
5. Click verification link
6. Log in with your credentials

### Option 2: Via Supabase Dashboard
1. Go to Supabase dashboard
2. Click **Authentication** → **Users**
3. Click **Add user**
4. Enter email and password
5. User is created instantly (no email verification needed)

---

## Step 10: Test the Application

### 1. Create an Incident
1. Log in to http://localhost:3000
2. Click **Dashboard** or **Incidents**
3. Click **New Incident** button
4. Fill in:
   - **Title**: "API Latency Spike"
   - **Description**: "Users reporting slow response times"
   - **Severity**: SEV2
5. Click **Create**

### 2. Add Timeline Events
1. Open the incident you created
2. Go to **Timeline** tab
3. Click **Add Event**
4. Enter: "Identified database connection pool at max capacity"
5. Click **Add**

### 3. Upload Attachments
1. Go to **Attachments** tab
2. Click **Upload File**
3. Select a file (max 10MB)
4. File uploads to Supabase Storage

### 4. Add Comments
1. Go to **Comments** tab
2. Type a comment: "Investigating root cause"
3. Click **Post**

### 5. Generate AI Summary
1. Go to **AI Summary** tab
2. Click **Generate Summary**
3. Wait 5-10 seconds
4. Review AI-generated summary with:
   - Executive Summary
   - Root Cause
   - Impact Assessment
   - Actions Taken
   - Recommendations
5. Click **Approve** or **Edit** then **Approve**

### 6. Change Status
1. Click status dropdown at top
2. Select **Acknowledged**
3. Status changes (only valid transitions allowed)

### 7. Manage Team
1. Click **Team** in sidebar
2. Add team members (need their user IDs)
3. Assign roles: Responder or Viewer
4. Transfer commander if needed

---

## 🛠️ Development Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f celery_worker
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart celery_worker
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes (CAUTION: deletes database data)
docker-compose down -v
```

### Access Service Shells
```bash
# Backend Python shell
docker-compose exec backend python

# Backend bash
docker-compose exec backend bash

# Database psql
docker-compose exec postgres psql -U postgres -d incident_handoff
```

### Run Tests
```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=app --cov-report=html

# Run specific test file
docker-compose exec backend pytest tests/test_incidents.py
```

### Create New Migration
```bash
# After changing models
docker-compose exec backend alembic revision --autogenerate -m "description"

# Apply migration
docker-compose exec backend alembic upgrade head
```

---

## 🐛 Troubleshooting

### Issue: Services won't start
**Solution:**
```bash
# Check Docker is running
docker --version

# Check ports are not in use
netstat -ano | findstr :8000
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Remove old containers and restart
docker-compose down
docker-compose up -d
```

### Issue: Database connection error
**Solution:**
```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Wait for health check
docker-compose ps
```

### Issue: Frontend can't connect to backend
**Solution:**
1. Check backend is running: http://localhost:8000/health
2. Check CORS settings in `backend/.env`
3. Verify `VITE_API_BASE_URL` in `frontend/.env`
4. Restart frontend: `docker-compose restart frontend`

### Issue: Supabase authentication fails
**Solution:**
1. Verify Supabase credentials in both `.env` files
2. Check Supabase project is active
3. Verify storage bucket `incident-attachments` exists
4. Check backend logs: `docker-compose logs backend`

### Issue: AI summary generation fails
**Solution:**
1. Verify OpenAI API key in `backend/.env`
2. Check you have credits: https://platform.openai.com/usage
3. Check Celery worker logs: `docker-compose logs celery_worker`
4. Verify Redis is running: `docker-compose ps redis`

### Issue: Celery worker not processing tasks
**Solution:**
```bash
# Check worker is running
docker-compose ps celery_worker

# Check logs
docker-compose logs celery_worker

# Restart worker
docker-compose restart celery_worker

# Test Redis connection
docker-compose exec redis redis-cli ping
```

---

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs (Swagger) | 8000 | http://localhost:8000/docs |
| API Docs (ReDoc) | 8000 | http://localhost:8000/redoc |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

## 🗂️ Project Structure

```
incident-handoff/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── ui/            # Reusable components
│   │   │   ├── layout/        # Layout components
│   │   │   └── incident/      # Incident-specific components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # React hooks
│   │   ├── contexts/          # React contexts
│   │   ├── types/             # TypeScript types
│   │   ├── lib/               # Utilities
│   │   └── config/            # Configuration
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env                   # YOUR FRONTEND CONFIG
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── models/            # SQLAlchemy models (13 models)
│   │   ├── routes/            # API endpoints (10 routers)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── workers/           # Celery tasks
│   │   ├── auth.py            # Authentication
│   │   ├── config.py          # Settings
│   │   ├── database.py        # Database connection
│   │   └── main.py            # FastAPI app
│   ├── tests/                 # Pytest tests
│   ├── alembic/               # Database migrations
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile
│   └── .env                   # YOUR BACKEND CONFIG
│
├── docs/                       # Documentation
│   ├── prd.md
│   ├── userflow.md
│   └── Incident_Handoff_Build_Plan.md
│
├── docker-compose.yml          # All services
├── README.md
├── GETTING_STARTED.md         # This file
├── WEEK0_IMPLEMENTATION.md
├── WEEK1_IMPLEMENTATION.md
└── WEEK2_IMPLEMENTATION.md
```

---

## 🎯 What You Can Do Now

### ✅ Incident Management
- Create, view, update, delete incidents
- Set severity levels (SEV1-4)
- Track status (detected → acknowledged → mitigating → resolved → postmortem)
- Search and filter incidents

### ✅ Timeline
- Add manual timeline events
- Edit and delete events
- View chronological history

### ✅ Attachments
- Upload files (max 10MB)
- Store in Supabase Storage
- Download attachments
- Delete attachments

### ✅ Comments
- Add comments to incidents
- View all comments
- Delete own comments

### ✅ Team Management
- Assign roles (Commander, Responder, Viewer)
- Add/remove team members
- Transfer commander role
- Role-based permissions

### ✅ AI Summaries
- Generate AI-powered summaries
- Review structured analysis
- Edit before approval
- Approve or discard
- View version history

### ✅ Dashboard
- View open incidents by severity
- MTTR (Mean Time To Resolution)
- AI summary acceptance rate
- Webhook statistics

---

## 📚 API Testing with cURL

### Health Check
```bash
curl http://localhost:8000/health
```

### Create Incident (requires auth token)
```bash
curl -X POST http://localhost:8000/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Connection Issue",
    "description": "Connection pool exhausted",
    "severity": "SEV1"
  }'
```

### List Incidents
```bash
curl http://localhost:8000/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Change Status
```bash
curl -X POST http://localhost:8000/api/incidents/{id}/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "acknowledged"}'
```

### Generate AI Summary
```bash
curl -X POST http://localhost:8000/api/incidents/{id}/ai-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Getting Your Auth Token

### Via Browser Console
1. Log in to http://localhost:3000
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run:
```javascript
(await supabase.auth.getSession()).data.session.access_token
```
5. Copy the token

### Use in API Calls
```bash
curl http://localhost:8000/api/incidents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎓 Next Steps

1. **Explore the UI**: Navigate through all pages and features
2. **Test Workflows**: Create incidents, add content, generate summaries
3. **Review API Docs**: http://localhost:8000/docs
4. **Run Tests**: `docker-compose exec backend pytest`
5. **Check Metrics**: View dashboard statistics
6. **Read Documentation**: Review WEEK1 and WEEK2 implementation docs

---

## 💡 Tips

- **Auto-reload**: Both frontend and backend auto-reload on code changes
- **Database GUI**: Use tools like pgAdmin or DBeaver to connect to PostgreSQL
- **Redis GUI**: Use RedisInsight to view Redis data
- **Logs**: Always check logs when debugging: `docker-compose logs -f`
- **Clean Start**: Use `docker-compose down -v && docker-compose up -d` for fresh start

---

## 🆘 Need Help?

1. **Check Logs**: `docker-compose logs -f [service-name]`
2. **Verify Config**: Ensure `.env` files are correct
3. **Check Services**: `docker-compose ps` - all should be "Up"
4. **Review Docs**: Read WEEK1 and WEEK2 implementation docs
5. **Test Endpoints**: Use Swagger UI at http://localhost:8000/docs

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] Supabase project created and configured
- [ ] OpenAI API key obtained
- [ ] Backend `.env` file configured
- [ ] Frontend `.env` file configured
- [ ] All services started with `docker-compose up -d`
- [ ] Database migrations run successfully
- [ ] All services showing "Up" status
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] User account created
- [ ] Test incident created
- [ ] AI summary generated successfully

**You're all set! 🎉**
