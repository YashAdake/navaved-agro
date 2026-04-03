"""Authentication middleware — JWT token validation and role-based access."""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.schemas.auth import TokenData
from app.services.auth_service import decode_access_token

logger = logging.getLogger("navaved.middleware")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> TokenData:
    """
    Dependency: Decode JWT token and return current user data.
    Raises 401 if token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    logger.debug("Validating JWT token (length=%d)", len(token) if token else 0)

    try:
        token_data = decode_access_token(token)
        logger.info("JWT validated — user=%s role=%s", token_data.email, token_data.role)
        return token_data
    except JWTError as e:
        logger.warning("JWT validation FAILED: %s", str(e))
        raise credentials_exception


async def require_admin(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """
    Dependency: Ensure the current user has ADMIN role.
    Raises 403 if user is not an admin.
    """
    if current_user.role != "ADMIN":
        logger.warning("ACCESS DENIED: user=%s has role=%s (ADMIN required)", current_user.email, current_user.role)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    logger.debug("Admin access GRANTED for user=%s", current_user.email)
    return current_user
