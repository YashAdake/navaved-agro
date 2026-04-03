"""Health check endpoint for Render uptime monitoring."""

from fastapi import APIRouter
from app.schemas.common import success_response

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check endpoint. Use with UptimeRobot to prevent Render sleep."""
    return success_response(
        data={"status": "healthy"},
        message="NAVAVED API is running",
    )
