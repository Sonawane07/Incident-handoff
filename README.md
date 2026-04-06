# Incident Handoff

A modern incident management platform that helps engineering teams track, document, and resolve production incidents with AI-powered summaries and seamless handoffs.

## Overview

Incident Handoff provides a single workspace per incident where responders can:
- 📝 Track timeline events chronologically
- 📎 Attach evidence (screenshots, logs, exports)
- 💬 Collaborate through comments
- 🤖 Generate AI-powered summaries grounded in evidence
- 🔄 Hand off cleanly between shifts with full audit trail
- 🔔 Receive real-time notifications
- 🔗 Integrate with external alert sources (PagerDuty, Sentry)

## Architecture

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** with custom "Serene Sentinel" design system
- **TanStack Query** for server state management
- **React Router** for navigation
- **Supabase Auth** for authentication

### Backend
- **FastAPI** REST API with automatic OpenAPI docs
- **PostgreSQL** database with **SQLAlchemy** ORM
- **Alembic** for database migrations
- **Celery** + **Redis** for background tasks
- **Supabase Auth** for JWT verification
- **OpenAI API** for AI summaries

### Infrastructure
- **Docker** + **Docker Compose** for local development
- **Supabase** for auth and storage
- **Redis** for caching and task queue
- **PostgreSQL** for primary database

## Project Structure

```
incident-handoff/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── contexts/     # React contexts
│   │   ├── lib/          # Third-party configs
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── workers/     # Celery tasks
│   │   └── main.py      # FastAPI app
│   ├── alembic/         # Database migrations
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Supabase account

### Using Docker (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/Sonawane07/Incident-handoff.git
cd incident-handoff
```

2. **Set up environment variables**:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Supabase credentials
```

3. **Start all services**:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)
- Celery worker
- Frontend (port 3000)

4. **Run database migrations**:
```bash
docker-compose exec backend alembic upgrade head
```

5. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Features

### Incident Management
- Create incidents with severity levels (SEV1-4)
- Status workflow: detected → acknowledged → mitigating → resolved → postmortem
- Role-based access control (commander, responder, viewer)
- Transfer incident ownership

### Timeline
- Manual event logging with timestamps
- Webhook-sourced events (PagerDuty, Sentry)
- AI-generated events
- Edit and delete capabilities

### Attachments
- Upload files up to 10MB
- Stored in Supabase Storage
- Secure signed URLs
- Download functionality

### Comments
- Team collaboration
- Threaded discussions
- Real-time updates

### AI Summaries
- Generate summaries from incident evidence
- Timeline narrative + actionable next steps
- Edit and approve workflow
- Version history
- JSON schema enforcement

### Notifications
- In-app notification center
- Incident created, resolved, escalated
- Commander transferred
- AI summary ready

### Webhooks
- Generic webhook endpoint
- PagerDuty integration
- Sentry integration
- HMAC verification
- Idempotency handling

### Real-time Updates
- Server-Sent Events (SSE)
- Live incident updates
- Automatic UI refresh

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Development Status

### ✅ Week 0 - Complete
- [x] Project skeleton
- [x] Database models and migrations
- [x] Supabase authentication
- [x] Docker configuration
- [x] Frontend application with all pages
- [x] Component library and design system

### 🚧 Week 1 - In Progress
- [ ] Incident CRUD endpoints
- [ ] Status machine
- [ ] Timeline events API
- [ ] Attachments API
- [ ] Comments API
- [ ] RBAC implementation

### 📋 Upcoming
- Week 2: AI summaries with OpenAI
- Week 3: Webhooks and real-time updates
- Week 4: Testing, metrics, and deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/Sonawane07/Incident-handoff/issues
- Documentation: See `/docs` folder

## Acknowledgments

- Design system inspired by "The Serene Sentinel" theme
- Built with modern web technologies
- Follows incident management best practices
