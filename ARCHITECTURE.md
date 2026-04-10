# Incident Handoff - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:3000                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages: Dashboard, Incidents, Workspace, Notifications   │  │
│  │  Components: UI, Layout, Incident-specific               │  │
│  │  Hooks: useIncidents, useTimeline, useAISummary, etc.    │  │
│  │  State: TanStack Query, React Context (Auth)             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             │ JWT Auth
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                              │
│                  http://localhost:8000                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes (10):                                             │  │
│  │    • /api/users          • /api/incidents                 │  │
│  │    • /api/incidents/{id}/timeline                         │  │
│  │    • /api/incidents/{id}/attachments                      │  │
│  │    • /api/incidents/{id}/comments                         │  │
│  │    • /api/incidents/{id}/roles                            │  │
│  │    • /api/incidents/{id}/ai-summary                       │  │
│  │    • /api/metrics        • /api/webhooks                  │  │
│  │                                                            │  │
│  │  Services:                                                │  │
│  │    • status_machine.py   • ai_summarizer.py              │  │
│  │    • storage.py                                           │  │
│  │                                                            │  │
│  │  Auth: Supabase JWT verification                          │  │
│  │  RBAC: Commander, Responder, Viewer                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────┬────────────────┬────────────────┬────────────────┬─────────┘
     │                │                │                │
     │ SQLAlchemy     │ Celery Tasks   │ Supabase SDK   │ OpenAI API
     ▼                ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│PostgreSQL│    │  Redis   │    │ Supabase │    │   OpenAI     │
│  :5432   │    │  :6379   │    │  Cloud   │    │  GPT-4 Turbo │
│          │    │          │    │          │    │              │
│ 13 Tables│    │ Broker + │    │ Auth +   │    │ AI Summaries │
│ Alembic  │    │ Backend  │    │ Storage  │    │              │
└─────────┘    └──────────┘    └──────────┘    └──────────────┘
                     │
                     ▼
            ┌──────────────┐
            │Celery Worker │
            │              │
            │ Tasks:       │
            │ • AI Summary │
            │ • Webhooks   │
            └──────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Frontend → Supabase Auth → JWT Token
                                      ↓
Frontend stores token → All API calls include token
                                      ↓
Backend validates JWT → Supabase public key
                                      ↓
User object created/retrieved → Request proceeds
```

### 2. Incident Creation Flow
```
User fills form → POST /api/incidents
                        ↓
Backend validates → Creates Incident
                        ↓
Auto-assigns Commander role → Creates IncidentRole
                        ↓
Returns incident → Frontend updates cache
                        ↓
Redirects to workspace
```

### 3. AI Summary Generation Flow
```
User clicks "Generate" → POST /api/incidents/{id}/ai-summary
                              ↓
Backend enqueues task → Celery task ID returned
                              ↓
Celery worker picks up → gather_incident_evidence()
                              ↓
Collects timeline, comments, attachments
                              ↓
Calls OpenAI API → GPT-4 analyzes evidence
                              ↓
Structured JSON response → Parsed and validated
                              ↓
Creates AISummary record → Status: PENDING
                              ↓
Frontend polls → Displays summary
                              ↓
Commander reviews → Approve or Discard
```

### 4. File Upload Flow
```
User selects file → POST /api/incidents/{id}/attachments
                         ↓
Backend receives multipart → Validates size (10MB)
                         ↓
Generates unique filename → {incident_id}/{uuid}.{ext}
                         ↓
Uploads to Supabase Storage → Public bucket
                         ↓
Gets public URL → Creates Attachment record
                         ↓
Returns metadata → Frontend displays
```

### 5. Status Transition Flow
```
User selects status → POST /api/incidents/{id}/status
                           ↓
Backend validates transition → status_machine.py
                           ↓
Valid? → Creates StatusChange record
     ↓                     ↓
     No                Updates Incident.status
     ↓                     ↓
Returns error      Sets resolved_at if resolved
                           ↓
                   Returns updated incident
```

## Database Schema

### Core Tables

**users**
- id (UUID, PK)
- email (unique)
- global_role (admin/member)
- created_at, updated_at

**incidents**
- id (UUID, PK)
- title, description
- severity (SEV1-4)
- status (detected → postmortem)
- commander_id (FK → users)
- created_at, updated_at, resolved_at

**incident_roles**
- id (UUID, PK)
- incident_id (FK → incidents)
- user_id (FK → users)
- role (commander/responder/viewer)
- assigned_by_id (FK → users)
- assigned_at

**timeline_events**
- id (UUID, PK)
- incident_id (FK → incidents)
- content
- event_type (manual/webhook/ai_generated)
- timestamp
- created_by_id (FK → users)
- is_edited

**status_changes**
- id (UUID, PK)
- incident_id (FK → incidents)
- from_status, to_status
- changed_by_id (FK → users)
- changed_at

**attachments**
- id (UUID, PK)
- incident_id (FK → incidents)
- filename, file_type, file_size
- storage_path (Supabase URL)
- uploaded_by_id (FK → users)
- uploaded_at

**comments**
- id (UUID, PK)
- incident_id (FK → incidents)
- content
- author_id (FK → users)
- created_at, updated_at

**ai_summaries**
- id (UUID, PK)
- incident_id (FK → incidents)
- executive_summary
- root_cause, impact
- actions_taken (JSON array)
- recommendations (JSON array)
- status (pending/approved/discarded)
- generated_at
- approved_at, approved_by_id
- discarded_at, discarded_by_id

**notifications** (Week 3)
**webhook_deliveries** (Week 3)
**audit_logs** (future)

## Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (server state), React Context (auth)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Date Utils**: date-fns
- **Icons**: Material Symbols

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Validation**: Pydantic
- **Auth**: Supabase (JWT)
- **Task Queue**: Celery
- **AI**: OpenAI GPT-4 Turbo

### Infrastructure
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Storage**: Supabase Storage
- **Container**: Docker + Docker Compose
- **Web Server**: Uvicorn (dev), Nginx (prod)

## Security

### Authentication
- Supabase Auth with JWT tokens
- Token validation on every request
- Automatic token refresh

### Authorization
- Role-Based Access Control (RBAC)
- Three-tier permission system:
  - **Commander**: Full control
  - **Responder**: Add content
  - **Viewer**: Read-only
- Per-incident role assignments
- Permission checks on all endpoints

### Data Protection
- HTTPS in production
- CORS configuration
- Environment variables for secrets
- Supabase RLS (Row Level Security)
- File size limits (10MB)
- Input validation with Pydantic

## Performance

### Caching
- Redis for Celery results
- TanStack Query cache on frontend
- Database connection pooling

### Async Processing
- Celery for long-running tasks
- Non-blocking AI generation
- Background webhook processing

### Database
- Indexed foreign keys
- Optimized queries with SQLAlchemy
- Connection pooling
- Alembic migrations

## Monitoring & Observability

### Metrics Endpoint
- Open incidents by severity
- MTTR (Mean Time To Resolution)
- AI summary acceptance rate
- Webhook success rate

### Logging
- Docker logs for all services
- Celery task logs
- FastAPI request logs
- Error tracking

### Health Checks
- `/health` endpoint
- Docker health checks for PostgreSQL and Redis
- Service dependency checks

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  Frontend       │            │  Backend        │
│  (Nginx)        │            │  (Multiple      │
│  Static Assets  │            │   Instances)    │
└─────────────────┘            └────────┬────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
            │  PostgreSQL  │    │    Redis     │   │Celery Workers│
            │  (Managed)   │    │  (Managed)   │   │ (Auto-scale) │
            └──────────────┘    └──────────────┘   └──────────────┘
```

## API Endpoint Summary

### Authentication & Users
- `GET /api/users/me` - Get current user
- `GET /api/users/{id}` - Get user by ID

### Incidents (CRUD)
- `POST /api/incidents` - Create incident
- `GET /api/incidents` - List incidents (paginated, filtered)
- `GET /api/incidents/{id}` - Get incident
- `PATCH /api/incidents/{id}` - Update incident
- `DELETE /api/incidents/{id}` - Delete incident
- `POST /api/incidents/{id}/status` - Change status

### Timeline
- `POST /api/incidents/{id}/timeline` - Add event
- `GET /api/incidents/{id}/timeline` - List events
- `PATCH /api/incidents/{id}/timeline/{event_id}` - Update event
- `DELETE /api/incidents/{id}/timeline/{event_id}` - Delete event

### Attachments
- `POST /api/incidents/{id}/attachments` - Upload file
- `GET /api/incidents/{id}/attachments` - List attachments
- `DELETE /api/incidents/{id}/attachments/{attachment_id}` - Delete file

### Comments
- `POST /api/incidents/{id}/comments` - Add comment
- `GET /api/incidents/{id}/comments` - List comments
- `DELETE /api/incidents/{id}/comments/{comment_id}` - Delete comment

### Team Management
- `POST /api/incidents/{id}/roles` - Assign role
- `GET /api/incidents/{id}/roles` - List team
- `DELETE /api/incidents/{id}/roles/{user_id}` - Remove member
- `POST /api/incidents/{id}/transfer-commander` - Transfer ownership

### AI Summaries
- `POST /api/incidents/{id}/ai-summary` - Generate summary (async)
- `GET /api/incidents/{id}/ai-summary` - List versions
- `GET /api/incidents/{id}/ai-summary/{summary_id}` - Get specific
- `PATCH /api/incidents/{id}/ai-summary/{summary_id}` - Edit
- `POST /api/incidents/{id}/ai-summary/{summary_id}/approve` - Approve
- `POST /api/incidents/{id}/ai-summary/{summary_id}/discard` - Discard

### Metrics
- `GET /api/metrics` - Dashboard metrics

### Health
- `GET /health` - Health check

**Total: 30 endpoints**

## Environment Variables

### Backend (.env)
```env
APP_ENV=development
SECRET_KEY=your-secret-key
API_V1_PREFIX=/api

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/incident_handoff
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:8000/api
```

## Key Design Decisions

### Why Supabase?
- Built-in authentication
- File storage included
- PostgreSQL-based (familiar)
- Free tier sufficient
- Easy integration

### Why Celery?
- Mature task queue
- Redis integration
- Async processing
- Task retry logic
- Monitoring tools

### Why OpenAI GPT-4 Turbo?
- Structured JSON output
- High-quality summaries
- Reasonable pricing
- Reliable API
- Good documentation

### Why TanStack Query?
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

### Why FastAPI?
- Automatic API docs
- Type safety with Pydantic
- Async support
- Fast performance
- Modern Python

## Future Enhancements

### Week 3 (Planned)
- Webhooks for external integrations
- Server-Sent Events (SSE) for real-time updates
- Notification system
- Email notifications

### Week 4 (Planned)
- Comprehensive testing
- Performance optimization
- Production deployment
- Monitoring setup

### Future Features
- Slack/Teams integration
- Postmortem templates
- Incident analytics
- SLA tracking
- Multi-tenancy
- Mobile app
