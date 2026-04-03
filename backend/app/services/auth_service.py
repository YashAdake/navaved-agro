"""Authentication service — JWT creation/verification and password hashing."""

import logging
from typing import Optional
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import get_settings
from app.models.user import User
from app.schemas.auth import TokenData

logger = logging.getLogger("navaved.auth")

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Password Hashing ---

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    logger.debug("Hashing password (length=%d)", len(password))
    hashed = pwd_context.hash(password)
    logger.debug("Password hashed successfully")
    return hashed


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a hashed password."""
    result = pwd_context.verify(plain_password, hashed_password)
    logger.debug("Password verification result: %s", result)
    return result


# --- JWT Token ---

def create_access_token(user: User) -> str:
    """Create a JWT access token for the given user."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "user_id": str(user.user_id),
        "email": user.email,
        "role": user.role,
        "exp": expire,
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    logger.info("JWT token created for user=%s role=%s expires=%s", user.email, user.role, expire.isoformat())
    return token


def decode_access_token(token: str) -> TokenData:
    """Decode and validate a JWT access token. Raises JWTError on failure."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        token_data = TokenData(
            user_id=payload["user_id"],
            email=payload["email"],
            role=payload["role"],
        )
        logger.debug("JWT decoded successfully for user=%s", token_data.email)
        return token_data
    except JWTError as e:
        logger.warning("JWT decode failed: %s", str(e))
        raise


# --- User Authentication ---

async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """Authenticate user by email and password. Returns User or None."""
    logger.info("Authentication attempt for email=%s", email)

    result = await db.execute(
        select(User).where(User.email == email, User.status == "ACTIVE")
    )
    user = result.scalar_one_or_none()

    if user is None:
        logger.warning("AUTH FAILED: No active user found with email=%s", email)
        return None
    if not verify_password(password, user.password_hash):
        logger.warning("AUTH FAILED: Wrong password for email=%s", email)
        return None

    logger.info("AUTH SUCCESS: user=%s (id=%s, role=%s)", user.email, user.user_id, user.role)
    return user


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get a user by their ID."""
    from uuid import UUID as PyUUID

    logger.debug("Looking up user by id=%s", user_id)
    result = await db.execute(
        select(User).where(User.user_id == PyUUID(user_id))
    )
    user = result.scalar_one_or_none()
    if user:
        logger.debug("User found: email=%s", user.email)
    else:
        logger.warning("User NOT found for id=%s", user_id)
    return user
