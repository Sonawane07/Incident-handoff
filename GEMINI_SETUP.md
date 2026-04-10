# Google Gemini Setup Guide

The project now uses **Google Gemini** instead of OpenAI for AI-powered incident summaries.

---

## 🔑 Get Your Gemini API Key

### Step 1: Go to Google AI Studio
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account

### Step 2: Create API Key
1. Click **"Get API key"** or **"Create API key"**
2. Select **"Create API key in new project"** (or choose existing project)
3. Your API key will be generated
4. Copy the key (starts with `AIza...`)
5. **Important**: Save it somewhere safe!

### Step 3: Enable Billing (Optional but Recommended)
1. Go to: https://console.cloud.google.com/billing
2. Link a billing account to your project
3. **Free tier includes**:
   - 15 requests per minute
   - 1 million tokens per minute
   - 1,500 requests per day
4. This is usually enough for development and testing!

---

## ⚙️ Configure Your Project

### Update Backend Configuration

**Edit `backend/.env` file:**

Replace the OpenAI section with:
```env
# Google Gemini
GEMINI_API_KEY=AIzaSyD...your-actual-key-here
GEMINI_MODEL=gemini-1.5-pro
```

**Remove these lines if they exist:**
```env
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

---

## 🔄 Update Your Running Application

If your application is already running, you need to restart it:

### Option 1: Restart Everything (Recommended)
```bash
cd "C:\Users\User\Documents\incident-handoff"
docker-compose down
docker-compose up -d --build
```

The `--build` flag rebuilds the containers with the new dependencies.

### Option 2: Restart Just the Backend and Worker
```bash
docker-compose restart backend
docker-compose restart celery_worker
```

---

## 🆕 Fresh Installation

If you're setting up for the first time:

1. **Edit `backend/.env`:**
   ```env
   GEMINI_API_KEY=AIzaSyD...your-key-here
   GEMINI_MODEL=gemini-1.5-pro
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

---

## 🧪 Test Gemini Integration

### 1. Create an Incident
1. Go to http://localhost:3000
2. Log in
3. Create a new incident
4. Add some timeline events and comments

### 2. Generate AI Summary
1. Go to the **AI Summary** tab
2. Click **"Generate Summary"**
3. Wait 5-10 seconds
4. You should see a Gemini-generated summary!

### 3. Check Logs (If It Fails)
```bash
docker-compose logs celery_worker
```

Look for any error messages related to Gemini API.

---

## 🆚 Gemini vs OpenAI

### Why Gemini?

**Advantages:**
- ✅ **Free tier**: 15 RPM, 1M tokens/min, 1,500 requests/day
- ✅ **No credit card required** for free tier
- ✅ **Multimodal**: Can analyze images (future feature)
- ✅ **Long context**: Up to 1M tokens
- ✅ **Fast**: Similar or better performance than GPT-4

**Considerations:**
- Different response format (handled in code)
- Slightly different prompt engineering
- Rate limits on free tier

### Model Options

**gemini-1.5-pro** (Default - Recommended)
- Best quality
- Longest context (1M tokens)
- Good for complex incident analysis

**gemini-1.5-flash** (Faster, Cheaper)
- Faster responses
- Lower cost
- Good for simple summaries

To use Flash model, change in `backend/.env`:
```env
GEMINI_MODEL=gemini-1.5-flash
```

---

## 🔧 Configuration Options

### Available Models
- `gemini-1.5-pro` - Best quality, recommended
- `gemini-1.5-flash` - Faster, cheaper
- `gemini-pro` - Previous generation (not recommended)

### Generation Parameters

The code uses these settings (in `ai_summarizer.py`):
```python
generation_config={
    "temperature": 0.7,      # Creativity (0.0-1.0)
    "top_p": 0.95,           # Nucleus sampling
    "top_k": 40,             # Top-k sampling
    "max_output_tokens": 2048  # Max response length
}
```

You can adjust these in the code if needed.

---

## 🐛 Troubleshooting

### Error: "API key not valid"
**Solution:**
1. Verify your API key in `backend/.env`
2. Make sure it starts with `AIza`
3. No extra spaces or quotes
4. Restart backend: `docker-compose restart backend celery_worker`

### Error: "Resource exhausted"
**Solution:**
- You've hit the rate limit (15 requests/minute on free tier)
- Wait a minute and try again
- Or enable billing for higher limits

### Error: "Model not found"
**Solution:**
1. Check model name in `backend/.env`
2. Use: `gemini-1.5-pro` or `gemini-1.5-flash`
3. Restart services

### AI Summary Not Generating
**Solution:**
1. Check Celery worker logs:
   ```bash
   docker-compose logs celery_worker
   ```
2. Verify Gemini API key is set
3. Check Redis is running:
   ```bash
   docker-compose ps redis
   ```
4. Restart worker:
   ```bash
   docker-compose restart celery_worker
   ```

### JSON Parsing Error
**Solution:**
- Gemini sometimes includes markdown formatting
- The code handles this automatically
- If it persists, check logs for the raw response
- May need to adjust prompt in `ai_summarizer.py`

---

## 💰 Pricing

### Free Tier (No Credit Card Needed)
- **Rate Limits**:
  - 15 requests per minute
  - 1 million tokens per minute
  - 1,500 requests per day
- **Cost**: $0
- **Good for**: Development, testing, small projects

### Pay-as-you-go (After Free Tier)
- **gemini-1.5-pro**:
  - Input: $3.50 per 1M tokens
  - Output: $10.50 per 1M tokens
- **gemini-1.5-flash**:
  - Input: $0.35 per 1M tokens
  - Output: $1.05 per 1M tokens

**Typical incident summary cost**: $0.001 - $0.01 per summary

---

## 📊 Monitoring Usage

### Check Your Usage
1. Go to: https://aistudio.google.com/app/apikey
2. Click on your API key
3. View usage statistics

### Check Quotas
1. Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. View your current quota and usage

---

## 🔄 Switching Back to OpenAI

If you want to switch back to OpenAI:

1. **Revert the code changes:**
   ```bash
   git checkout HEAD -- backend/app/services/ai_summarizer.py
   git checkout HEAD -- backend/requirements.txt
   git checkout HEAD -- backend/app/config.py
   ```

2. **Update `.env`:**
   ```env
   OPENAI_API_KEY=sk-proj-...
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

3. **Rebuild:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

---

## ✅ Verification Checklist

- [ ] Got Gemini API key from https://aistudio.google.com/app/apikey
- [ ] Added key to `backend/.env` as `GEMINI_API_KEY`
- [ ] Set model to `gemini-1.5-pro` in `backend/.env`
- [ ] Rebuilt containers: `docker-compose up -d --build`
- [ ] Created test incident
- [ ] Generated AI summary successfully
- [ ] Reviewed summary quality

---

## 🎓 Next Steps

1. **Test thoroughly**: Generate summaries for different incident types
2. **Monitor usage**: Keep an eye on your API quota
3. **Adjust prompts**: Modify `ai_summarizer.py` if needed
4. **Enable billing**: If you need higher rate limits

---

## 📞 Support

### Gemini Documentation
- API Reference: https://ai.google.dev/api/python
- Quickstart: https://ai.google.dev/tutorials/python_quickstart
- Pricing: https://ai.google.dev/pricing

### Project Issues
- Check logs: `docker-compose logs -f celery_worker`
- Verify configuration: `backend/.env`
- Restart services: `docker-compose restart backend celery_worker`

---

**You're all set with Google Gemini! 🚀**
