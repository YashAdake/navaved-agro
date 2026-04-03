"""Common response schemas used across all endpoints."""

from typing import Any, Optional, List
from pydantic import BaseModel


class PaginationMeta(BaseModel):
    """Pagination metadata returned with list responses."""
    page: int
    limit: int
    total: int
    total_pages: int


class SuccessResponse(BaseModel):
    """Standard success response wrapper."""
    success: bool = True
    data: Any = None
    message: str = ""
    pagination: Optional[PaginationMeta] = None


class ErrorResponse(BaseModel):
    """Standard error response wrapper."""
    success: bool = False
    error: str = ""


def paginated_response(
    data: Any,
    total: int,
    page: int,
    limit: int,
    message: str = "Fetched successfully",
) -> dict:
    """Helper to construct a paginated success response."""
    total_pages = max(1, (total + limit - 1) // limit)
    return {
        "success": True,
        "data": data,
        "message": message,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
        },
    }


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Helper to construct a simple success response."""
    return {
        "success": True,
        "data": data,
        "message": message,
    }


def error_response(error: str = "Something went wrong") -> dict:
    """Helper to construct an error response."""
    return {
        "success": False,
        "error": error,
    }
