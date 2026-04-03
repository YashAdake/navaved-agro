"""Authentication router — login and current user endpoints."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import LoginRequest
from app.schemas.common import success_response, error_response
from app.middleware.auth import get_current_user
from app.schemas.auth import TokenData
from app.services import auth_service

logger = logging.getLogger("navaved.routers")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate admin user and return JWT token."""
    logger.info("LOGIN REQUEST: email=%s", request.email)

    user = await auth_service.authenticate_user(db, request.email, request.password)

    if not user:
        logger.warning("LOGIN REJECTED: email=%s — invalid credentials", request.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = auth_service.create_access_token(user)
    logger.info("LOGIN SUCCESS: email=%s user_id=%s role=%s", user.email, user.user_id, user.role)

    return success_response(
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": str(user.user_id),
                "user_name": user.user_name,
                "email": user.email,
                "role": user.role,
            },
        },
        message="Login successful",
    )


@router.get("/me")
async def get_me(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user info."""
    logger.info("GET /me — user=%s", current_user.email)

    user = await auth_service.get_user_by_id(db, current_user.user_id)

    if not user:
        logger.error("GET /me FAILED: user_id=%s not found in DB", current_user.user_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    logger.info("GET /me SUCCESS: email=%s role=%s status=%s", user.email, user.role, user.status)
    return success_response(
        data={
            "user_id": str(user.user_id),
            "user_name": user.user_name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
        },
        message="User info fetched",
    )
