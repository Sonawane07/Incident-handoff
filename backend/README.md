# Incident Handoff - Backend API

FastAPI backend for the Incident Handoff platform with Supabase authentication, PostgreSQL database, and Celery task queue.

## Features

- **FastAPI** REST API with automatic OpenAPI documentation
- **Supabase Auth** for authentication and user management
- **PostgreSQL** database with SQLAlchemy ORM
- **Alembic** for database migrations
- **Celery** + **Redis** for background task processing
- **Docker** support for easy deployment

## Tech Stack

- Python 3.11+
- FastAPI 0.109+
- SQLAlchemy 2.0+
- Alembic 1.13+
- Supabase 2.3+
- Celery 5.3+
- Redis 5.0+
- PostgreSQL 15+

## Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy database models
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── workers/         # Celery tasks
│   ├── auth.py          # Authentication utilities
│   ├── config.py        # Configuration management
│   ├── database.py      # Database connection
│   └── main.py          # FastAPI application
├── alembic/             # Database migrations
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
└── .env.example         # Environment variables template
```

## Getting Started

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- Supabase account

### Local Development

1. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations**:
```bash
alembic upgrade head
```

5. **Start the API server**:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

6. **Start Celery worker** (in another terminal):
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

### Using Docker

1. **Start all services**:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis (port 6379)
- FastAPI backend (port 8000)
- Celery worker
- Frontend (port 3000)

2. **Run migrations**:
```bash
docker-compose exec backend alembic upgrade head
```

3. **View logs**:
```bash
docker-compose logs -f backend
```

## Database Migrations

### Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations:
```bash
alembic upgrade head
```

### Rollback migration:
```bash
alembic downgrade -1
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Models

- **User**: User accounts and authentication
- **Incident**: Core incident entity
- **IncidentRole**: User roles per incident (commander, responder, viewer)
- **TimelineEvent**: Chronological incident events
- **StatusChange**: Incident status transition history
- **Attachment**: File attachments
- **Comment**: User comments
- **AISummary**: AI-generated incident summaries
- **Notification**: User notifications
- **WebhookDelivery**: External webhook logs
- **AuditLog**: Comprehensive audit trail

## Authentication

The API uses Supabase JWT tokens for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-supabase-jwt-token>
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/incident_handoff

# Redis
REDIS_URL=redis://localhost:6379/0

# Application
SECRET_KEY=your-secret-key
APP_ENV=development
API_V1_PREFIX=/api

# CORS
CORS_ORIGINS=http://localhost:3000

# OpenAI (for AI summaries)
OPENAI_API_KEY=your_openai_api_key
```

## Testing

Run tests with pytest:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Development Roadmap

### Week 0 (Complete) ✅
- [x] Project skeleton
- [x] Database models
- [x] Alembic migrations
- [x] Supabase authentication
- [x] Docker configuration

### Week 1 (Next)
- [ ] Incident CRUD endpoints
- [ ] Status machine implementation
- [ ] Timeline events API
- [ ] Attachments with Supabase Storage
- [ ] Comments API
- [ ] RBAC implementation

### Week 2
- [ ] AI summary generation with OpenAI
- [ ] Celery task processing
- [ ] Frontend integration

### Week 3
- [ ] Webhook ingestion
- [ ] SSE real-time updates
- [ ] Notifications system

### Week 4
- [ ] Audit logging
- [ ] Metrics endpoint
- [ ] Testing suite
- [ ] CI/CD pipeline

## License

MIT
