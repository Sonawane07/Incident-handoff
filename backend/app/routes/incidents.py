from fastapi import APIRouter

router = APIRouter()

# Placeholder - will be implemented in Week 1
@router.get("/")
async def list_incidents():
    return {"message": "Incidents endpoint - to be implemented"}
