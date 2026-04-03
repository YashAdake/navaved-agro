"""Authentication schemas for login request/response and JWT token data."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request body."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response with JWT token."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class TokenData(BaseModel):
    """Decoded JWT token payload."""
    user_id: str
    email: str
    role: str
