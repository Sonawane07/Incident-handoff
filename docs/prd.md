# Incident Handoff — Product Requirements Document

## 1. Problem Statement

When production incidents happen, on-call engineers waste critical time piecing together context from scattered Slack threads, alert dashboards, and tribal knowledge. Handoffs between shifts lose information — the next responder has to re-investigate what was already tried. Post-incident reviews lack structured data because the incident lived across five tools and nobody's memory.

**Who is affected:** On-call engineers, incident commanders, engineering managers, SRE teams.

**Current workaround:** Slack channels, Google Docs, copy-pasting alerts manually, verbal handoffs.

**Cost of doing nothing:** Longer outages, repeated debugging, incomplete postmortems, frustrated engineers.

---

## 2. Product Vision

A single workspace per incident where responders attach evidence, track what happened in order, get an AI-drafted summary grounded in the attached evidence, and hand off cleanly to the next person — with a full audit trail.

---

## 3. Target Users

| User | Role | Needs |
|------|------|-------|
| **Incident Commander** | Owns the incident end-to-end | Create, assign team, change status, approve AI summary, transfer ownership |
| **Responder** | Actively investigating/fixing | Add timeline events, upload attachments, comment, view AI suggestions |
| **Viewer** | Stakeholder or manager observing | Read-only access to incident status, timeline, summary |
| **Admin** | Platform administrator | Manage users, view all incidents, configure webhook sources, view audit logs |

---

## 4. Functional Requirements

### 4.1 Incident Lifecycle

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Users can create an incident with title, severity (SEV1-4), and description | P0 |
| FR-2 | Creator is auto-assigned as incident commander | P0 |
| FR-3 | Incidents follow a strict state machine: `detected` → `acknowledged` → `mitigating` → `resolved` → `postmortem` | P0 |
| FR-4 | Every status transition is logged with actor and timestamp | P0 |
| FR-5 | Only valid transitions are allowed; invalid ones return an error | P0 |
| FR-6 | Incidents can be filtered and sorted by status, severity, and date | P1 |

### 4.2 Timeline

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7 | Commander and responders can add manual timeline events with text and optional timestamp | P0 |
| FR-8 | Timeline events are displayed in chronological order | P0 |
| FR-9 | Events can be edited (marked as edited) and deleted | P1 |
| FR-10 | Events ingested from webhooks are tagged with their source (e.g., "pagerduty") | P1 |
| FR-11 | AI-generated events are visually distinct from manual ones | P1 |

### 4.3 Attachments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12 | Users can upload files (screenshots, logs, exports) to an incident | P0 |
| FR-13 | Files are stored in Supabase Storage with signed URLs for secure access | P0 |
| FR-14 | Attachment metadata (filename, type, upload time) is displayed in the incident | P0 |
| FR-15 | Attachments can be deleted by the uploader or commander | P1 |

### 4.4 Comments

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-16 | Users can add text comments to an incident (separate from the timeline) | P0 |
| FR-17 | Comments are displayed in chronological order | P0 |

### 4.5 Auth and RBAC

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-18 | Users sign up and log in via email/password (Supabase Auth) | P0 |
| FR-19 | Global roles: `admin` and `member` | P0 |
| FR-20 | Per-incident roles: `commander`, `responder`, `viewer` | P0 |
| FR-21 | Commander can add/remove team members and assign per-incident roles | P0 |
| FR-22 | Viewers have read-only access; responders can add content; commander can manage the incident | P0 |

### 4.6 AI Summary

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-23 | Commander or responder can trigger "Generate Summary" for an incident | P0 |
| FR-24 | AI collects all timeline events, attachment metadata, and comments as input | P0 |
| FR-25 | AI returns a structured JSON response: `timeline_narrative` (string) and `next_steps` (list of strings) | P0 |
| FR-26 | AI output is enforced via JSON schema; malformed responses trigger a retry | P0 |
| FR-27 | The prompt constrains the LLM to use ONLY the provided evidence | P0 |
| FR-28 | AI drafts are versioned; users can view past versions | P1 |
| FR-29 | Users can approve, edit, or discard an AI draft | P0 |
| FR-30 | Approved summary becomes the canonical incident summary | P0 |

### 4.7 Webhook Ingestion

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-31 | System exposes POST endpoints for external alert sources (generic, PagerDuty-shaped, Sentry-shaped) | P1 |
| FR-32 | Webhooks are verified via HMAC signature | P1 |
| FR-33 | Duplicate webhooks are rejected via idempotency key | P1 |
| FR-34 | Parsed webhooks auto-create timeline events tagged with their source | P1 |
| FR-35 | Raw webhook payloads are stored for debugging | P1 |

### 4.8 Real-time Updates

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-36 | Incident workspace page updates live when new events, status changes, or AI results arrive (SSE) | P1 |
| FR-37 | Visual indicator shows "Live" connection status | P2 |

### 4.9 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-38 | In-app notifications on: incident created, severity escalated, commander transferred, AI summary ready, incident resolved | P1 |
| FR-39 | Users can view and mark notifications as read | P1 |
| FR-40 | Commander can transfer incident ownership to another team member | P1 |

### 4.10 Observability

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-41 | Append-only audit log records every mutation with actor and timestamp | P1 |
| FR-42 | Metrics endpoint exposes: open incidents count, MTTR, AI job latency, webhook success rate | P2 |
| FR-43 | Backend emits structured JSON logs with request IDs | P1 |

### 4.11 Dashboard and Extras

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-44 | Dashboard page with summary cards: open incidents by severity, MTTR trend, AI acceptance rate | P2 |
| FR-45 | Full-text search across incidents by title and description | P2 |
| FR-46 | Auto-generate a postmortem document from approved summary + timeline + metadata | P2 |
| FR-47 | Export incidents as CSV/JSON | P2 |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1 | API response time for CRUD operations | < 300ms p95 |
| NFR-2 | AI summary generation (end-to-end including LLM call) | < 30s |
| NFR-3 | Webhook ingestion acknowledgment | < 500ms |
| NFR-4 | System availability (deployed) | 99% uptime on managed hosting |
| NFR-5 | Auth token validation | Every API request (no unauthenticated access except health check) |
| NFR-6 | File upload size limit | 10 MB per file |
| NFR-7 | Test coverage (backend) | > 70% on core modules (status machine, RBAC, AI pipeline) |

---

## 6. Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy
- **Database:** Supabase (PostgreSQL), Alembic for migrations
- **Queue:** Redis + Celery
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (email/password)
- **AI:** OpenAI API with JSON mode / function calling
- **Real-time:** SSE (Server-Sent Events) via Redis pub/sub
- **Deploy:** Docker, GitHub Actions CI, Railway/Fly.io (backend), Vercel (frontend)

---

## 7. Out of Scope (v1)

- Mobile app or responsive mobile-first design
- Slack/Teams bot integration (only stubs)
- Multi-org / multi-tenant isolation
- Custom alert routing rules
- Video/audio uploads
- SSO / SAML authentication
- On-premise deployment guide

---

## 8. Success Metrics (for resume / demo)

- Median time from incident creation to approved AI summary on 10 test incidents
- AI summary acceptance rate (approved vs discarded)
- Webhook processing success rate on 50+ test payloads
- API p95 latency under simulated concurrent usage
- CI pipeline passes on every push with > 70% test coverage
