from .celery_app import celery_app


@celery_app.task(name="app.workers.tasks.test_task")
def test_task(message: str):
    """Test task to verify Celery is working"""
    print(f"Test task executed with message: {message}")
    return {"status": "success", "message": message}


# AI Summary generation task
@celery_app.task(name="app.workers.tasks.generate_ai_summary")
def generate_ai_summary(incident_id: str):
    """Generate AI summary for an incident"""
    from ..database import SessionLocal
    from ..services.ai_summarizer import create_ai_summary
    
    db = SessionLocal()
    try:
        summary = create_ai_summary(db, incident_id)
        return {
            "status": "success",
            "summary_id": str(summary.id),
            "incident_id": incident_id
        }
    except Exception as e:
        print(f"Error generating AI summary: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "incident_id": incident_id
        }
    finally:
        db.close()


# Webhook processing task - to be implemented in Week 3
@celery_app.task(name="app.workers.tasks.process_webhook")
def process_webhook(webhook_id: str):
    """Process incoming webhook"""
    # Placeholder - will be implemented in Week 3
    pass
