from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import incidents, timeline, attachments, comments, ai_summary, notifications, webhooks, users, metrics

app = FastAPI(
    title="Incident Handoff API",
    description="API for managing production incidents with AI-powered summaries",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.APP_ENV}

# Include routers
app.include_router(users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["users"])
app.include_router(incidents.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["incidents"])
app.include_router(timeline.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["timeline"])
app.include_router(attachments.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["attachments"])
app.include_router(comments.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["comments"])
app.include_router(ai_summary.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["ai-summary"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_PREFIX}/notifications", tags=["notifications"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_PREFIX}/webhooks", tags=["webhooks"])

# Import roles router
from .routes import roles
app.include_router(roles.router, prefix=f"{settings.API_V1_PREFIX}/incidents", tags=["roles"])
app.include_router(metrics.router, prefix=f"{settings.API_V1_PREFIX}/metrics", tags=["metrics"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
