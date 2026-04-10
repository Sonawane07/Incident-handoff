# Complete Setup Guide for Beginners

This guide will walk you through setting up the Incident Handoff project from scratch. No prior experience needed!

---

## ✅ What You've Already Done

- [x] Created Supabase account
- [x] Created Supabase project
- [x] Created storage bucket (public)

Great! Let's continue from here.

---

## Step 1: Get Your Supabase Credentials

### 1.1 Find Your Project Settings
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Click on your project
3. Click the **⚙️ Settings** icon in the left sidebar (near the bottom)
4. Click **API** in the settings menu

### 1.2 Copy These Values (Keep This Tab Open)

You'll see several values. Copy these THREE:

**A. Project URL**
- Look for "Project URL"
- It looks like: `https://abcdefghijk.supabase.co`
- Copy this entire URL

**B. anon public key**
- Look for "Project API keys" section
- Find the key labeled `anon` `public`
- It's a LONG string starting with `eyJ...`
- Click the **copy** icon next to it

**C. service_role secret key**
- In the same "Project API keys" section
- Find the key labeled `service_role` `secret`
- It's also a LONG string starting with `eyJ...`
- Click the **copy** icon next to it
- ⚠️ **IMPORTANT**: Keep this secret! Don't share it.

### 1.3 Verify Your Storage Bucket
1. Click **Storage** in the left sidebar
2. You should see your bucket (you created this)
3. **Important**: Make sure the bucket name is exactly: `incident-attachments`
4. If it's named differently, either:
   - Rename it to `incident-attachments`, OR
   - Remember the name (we'll update the code later)

---

## Step 2: Get Your Google Gemini API Key

### 2.1 Go to Google AI Studio
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account

### 2.2 Create API Key
1. Click **"Get API key"** or **"Create API key"**
2. Select **"Create API key in new project"** (or choose existing project)
3. Your API key will be generated instantly
4. Copy the key (starts with `AIza...`)
5. **IMPORTANT**: Save it in a safe place (like Notepad)

### 2.3 Free Tier (No Credit Card Needed!)
**Good news**: Gemini has a generous free tier:
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day
- **No credit card required!**

This is perfect for development and testing!

---

## Step 3: Install Docker Desktop

### 3.1 Download Docker
1. Go to https://www.docker.com/products/docker-desktop/
2. Click **Download for Windows**
3. Wait for download to complete

### 3.2 Install Docker
1. Run the installer (Docker Desktop Installer.exe)
2. Follow the installation wizard
3. Keep all default settings
4. Click **Install**
5. Wait for installation (takes 2-3 minutes)
6. Click **Close and restart** when done

### 3.3 Start Docker
1. After restart, Docker Desktop will start automatically
2. You'll see the Docker icon in your system tray (bottom-right)
3. Wait until it says "Docker Desktop is running"
4. If you see a tutorial, you can skip it

### 3.4 Verify Docker is Working
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. In the black window (Command Prompt), type:
   ```
   docker --version
   ```
4. Press Enter
5. You should see something like: `Docker version 24.0.x`
6. If you see this, Docker is working! ✅

---

## Step 4: Configure the Backend

### 4.1 Open the Backend Folder
1. Press `Windows Key + E` (opens File Explorer)
2. Navigate to: `C:\Users\User\Documents\incident-handoff`
3. Open the `backend` folder
4. You should see files like `.env.example`, `requirements.txt`, etc.

### 4.2 Create the .env File
1. Find the file named `.env.example`
2. Right-click on it
3. Click **Copy**
4. Right-click in empty space
5. Click **Paste**
6. You now have a file called `.env.example - Copy`
7. Right-click on `.env.example - Copy`
8. Click **Rename**
9. Change the name to just: `.env` (remove everything else)
10. Press Enter
11. If Windows asks "Are you sure?", click **Yes**

### 4.3 Edit the .env File
1. Right-click on the `.env` file
2. Click **Open with** → **Notepad**
3. You'll see a file with many lines

### 4.4 Fill in Your Values

Now, replace the placeholder values with your REAL values:

**Find this line:**
```
SUPABASE_URL=
```
**Replace with your Project URL from Step 1.2.A:**
```
SUPABASE_URL=https://abcdefghijk.supabase.co
```

**Find this line:**
```
SUPABASE_ANON_KEY=
```
**Replace with your anon key from Step 1.2.B:**
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```

**Find this line:**
```
SUPABASE_SERVICE_ROLE_KEY=
```
**Replace with your service_role key from Step 1.2.C:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OT...
```

**Find this line:**
```
GEMINI_API_KEY=
```
**Replace with your Gemini API key from Step 2.2:**
```
GEMINI_API_KEY=AIzaSyD...your-actual-gemini-key-here
```

**Find this line:**
```
SECRET_KEY=
```
**Replace with any random string (make it long and random):**
```
SECRET_KEY=my-super-secret-key-change-this-to-something-random-12345
```

### 4.5 Keep These Lines As-Is
These lines should NOT be changed:
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/incident_handoff
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### 4.6 Save the File
1. Click **File** → **Save** (or press `Ctrl + S`)
2. Close Notepad

---

## Step 5: Configure the Frontend

### 5.1 Open the Frontend Folder
1. Go back to File Explorer
2. Navigate to: `C:\Users\User\Documents\incident-handoff`
3. Open the `frontend` folder

### 5.2 Create the .env File
1. Find `.env.example`
2. Copy it (Right-click → Copy)
3. Paste it (Right-click in empty space → Paste)
4. Rename the copy to: `.env`
5. Click **Yes** if Windows asks

### 5.3 Edit the .env File
1. Right-click on `.env`
2. Click **Open with** → **Notepad**

### 5.4 Fill in Your Values

**Find this line:**
```
VITE_SUPABASE_URL=
```
**Replace with your Project URL (SAME as backend):**
```
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
```

**Find this line:**
```
VITE_SUPABASE_ANON_KEY=
```
**Replace with your anon key (SAME as backend):**
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```

**This line should stay as-is:**
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 5.5 Save the File
1. Click **File** → **Save**
2. Close Notepad

---

## Step 6: Start the Application

### 6.1 Open Command Prompt
1. Press `Windows Key + R`
2. Type `cmd`
3. Press Enter
4. You'll see a black window

### 6.2 Navigate to Project Folder
In the Command Prompt, type this EXACTLY (including the quotes):
```
cd "C:\Users\User\Documents\incident-handoff"
```
Press Enter.

### 6.3 Start All Services
Type this command:
```
docker-compose up -d
```
Press Enter.

**What happens now:**
- Docker will download images (first time only, takes 5-10 minutes)
- You'll see lots of text scrolling
- It will say "Pulling" for PostgreSQL, Redis, etc.
- Wait patiently - this is normal!
- When done, you'll see "Creating..." and "Created" messages

**You'll see something like:**
```
[+] Running 5/5
 ✔ Container incident-handoff-postgres-1        Started
 ✔ Container incident-handoff-redis-1           Started
 ✔ Container incident-handoff-backend-1         Started
 ✔ Container incident-handoff-celery_worker-1   Started
 ✔ Container incident-handoff-frontend-1        Started
```

### 6.4 Verify Services Started
Type this command:
```
docker-compose ps
```
Press Enter.

**You should see 5 services with "Up" status:**
```
NAME                              STATUS
incident-handoff-backend-1        Up
incident-handoff-celery_worker-1  Up
incident-handoff-frontend-1       Up
incident-handoff-postgres-1       Up (healthy)
incident-handoff-redis-1          Up (healthy)
```

If you see this, great! ✅

---

## Step 7: Set Up the Database

### 7.1 Run Database Migrations
In the same Command Prompt, type:
```
docker-compose exec backend alembic upgrade head
```
Press Enter.

**What this does:**
- Creates all database tables
- Sets up the schema
- Prepares the database for use

**You should see:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> xxxxx
```

If you see "INFO" messages, it worked! ✅

---

## Step 8: Access the Application

### 8.1 Open the Frontend
1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Go to: **http://localhost:3000**
3. You should see the Incident Handoff login page!

### 8.2 Create Your First User
1. Click **Sign Up** (or **Create Account**)
2. Enter your email address
3. Enter a password (at least 6 characters)
4. Click **Sign Up**
5. Check your email for a verification link
6. Click the verification link
7. Go back to http://localhost:3000
8. Log in with your email and password

### 8.3 You're In!
You should now see the Dashboard! 🎉

---

## Step 9: Test the Application

### 9.1 Create Your First Incident
1. Click **Incidents** in the sidebar (or **New Incident** button)
2. Fill in the form:
   - **Title**: "Test Incident - Database Slow"
   - **Description**: "Users reporting slow response times from the database"
   - **Severity**: Select **SEV2**
3. Click **Create Incident**
4. You'll be taken to the incident workspace

### 9.2 Add a Timeline Event
1. You should see tabs: Timeline, Attachments, Comments, AI Summary
2. Make sure you're on the **Timeline** tab
3. Click **Add Event** button
4. Type: "Identified high CPU usage on database server"
5. Click **Add** (or **Save**)
6. You should see your event appear!

### 9.3 Add a Comment
1. Click the **Comments** tab
2. Type in the comment box: "Investigating the root cause"
3. Click **Post Comment**
4. Your comment appears!

### 9.4 Upload an Attachment
1. Click the **Attachments** tab
2. Click **Upload File** button
3. Choose any file from your computer (max 10MB)
4. Click **Open**
5. The file uploads to Supabase Storage!
6. You'll see it in the list

### 9.5 Generate AI Summary (The Cool Part!)
1. Click the **AI Summary** tab
2. Click the **Generate Summary** button
3. Wait 5-10 seconds (you'll see a loading spinner)
4. An AI-generated summary appears with:
   - **Executive Summary**: Overview of the incident
   - **Root Cause**: What caused it
   - **Impact**: Who was affected
   - **Actions Taken**: What you did
   - **Recommendations**: What to do next
5. Click **Approve** to save it

### 9.6 Change Incident Status
1. At the top of the page, you'll see the current status badge
2. Click the **Change Status** button (or status dropdown)
3. Select **Acknowledged**
4. The status changes!
5. Try changing it to **Mitigating**, then **Resolved**

---

## Step 10: View API Documentation

### 10.1 Open Swagger UI
1. Open a new browser tab
2. Go to: **http://localhost:8000/docs**
3. You'll see interactive API documentation
4. You can test all 30 endpoints here!

### 10.2 Try the Health Check
1. Find the **GET /health** endpoint
2. Click on it to expand
3. Click **Try it out**
4. Click **Execute**
5. You should see:
   ```json
   {
     "status": "healthy"
   }
   ```

---

## 🎉 Congratulations!

You've successfully:
- ✅ Set up Supabase
- ✅ Got OpenAI API key
- ✅ Installed Docker
- ✅ Configured environment files
- ✅ Started all services
- ✅ Created the database
- ✅ Created your first user
- ✅ Created an incident
- ✅ Added timeline events, comments, and attachments
- ✅ Generated an AI summary

**Your application is now fully running!**

---

## 📋 What You Can Do Now

### Explore Features
- Create more incidents
- Try different severity levels (SEV1, SEV2, SEV3, SEV4)
- Test the status workflow (detected → acknowledged → mitigating → resolved → postmortem)
- Generate multiple AI summaries and compare versions
- Upload different file types
- Add team members (you'll need their user IDs)

### View Logs (If Something Goes Wrong)
```
docker-compose logs backend
docker-compose logs celery_worker
docker-compose logs frontend
```

### Stop the Application
When you're done:
```
docker-compose down
```

### Start Again Later
Next time you want to use it:
```
cd "C:\Users\User\Documents\incident-handoff"
docker-compose up -d
```

---

## 🐛 Common Issues & Solutions

### Issue: "docker-compose: command not found"
**Solution:**
- Make sure Docker Desktop is running
- Look for the Docker icon in your system tray
- If not running, start Docker Desktop from Start Menu

### Issue: Port already in use
**Solution:**
```
docker-compose down
docker-compose up -d
```

### Issue: Can't access http://localhost:3000
**Solution:**
1. Check if frontend is running:
   ```
   docker-compose ps
   ```
2. Check logs:
   ```
   docker-compose logs frontend
   ```
3. Restart frontend:
   ```
   docker-compose restart frontend
   ```
4. Wait 30 seconds and try again

### Issue: Login doesn't work
**Solution:**
1. Check your email for the verification link
2. Make sure you clicked the verification link
3. Check Supabase credentials in both `.env` files
4. Try logging in again

### Issue: AI Summary fails
**Solution:**
1. Check OpenAI API key in `backend/.env`
2. Verify you have credits: https://platform.openai.com/usage
3. Check Celery worker logs:
   ```
   docker-compose logs celery_worker
   ```
4. Make sure Redis is running:
   ```
   docker-compose ps redis
   ```

### Issue: File upload fails
**Solution:**
1. Check your Supabase storage bucket exists
2. Make sure it's named `incident-attachments`
3. Make sure it's set to **Public**
4. Check Supabase credentials in `backend/.env`

---

## 📞 Getting Help

If you're stuck:

1. **Check the logs:**
   ```
   docker-compose logs -f
   ```

2. **Verify all services are running:**
   ```
   docker-compose ps
   ```

3. **Check your .env files:**
   - Make sure all values are filled in
   - No extra spaces
   - No quotes around values

4. **Restart everything:**
   ```
   docker-compose down
   docker-compose up -d
   ```

---

## 🎓 Next Steps

Now that you have it running:

1. **Read the Documentation:**
   - `ARCHITECTURE.md` - How the system works
   - `WEEK1_IMPLEMENTATION.md` - What features exist
   - `WEEK2_IMPLEMENTATION.md` - How AI works

2. **Experiment:**
   - Create multiple incidents
   - Test all features
   - Try the API at http://localhost:8000/docs

3. **Customize:**
   - Change colors in `frontend/tailwind.config.js`
   - Add your own features
   - Modify the AI prompts in `backend/app/services/ai_summarizer.py`

---

## 🚀 You're All Set!

The application is running and ready to use. Enjoy exploring! 🎉

If you have any questions, refer back to this guide or check the other documentation files.
